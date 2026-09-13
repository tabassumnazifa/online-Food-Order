using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Enums;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
using FoodDelivery.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FoodDelivery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPaymentService _paymentService;

        public OrderController(
            ApplicationDbContext context,
            IPaymentService paymentService)
        {
            _context = context;
            _paymentService = paymentService;
        }

        // =========================
        // CREATE ORDER
        // =========================
        [HttpPost("create")]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> CreateOrder(CreateOrderDto model)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == model.RestaurantId);

            if (restaurant == null)
                return NotFound("Restaurant not found.");

            // Prevent customers from ordering from suspended restaurants
            if (restaurant.IsSuspended)
            {
                return BadRequest(
                    $"This restaurant is currently suspended. " +
                    $"Reason: {restaurant.SuspensionReason ?? "Not specified"}"
                );
            }

            var order = new Order
            {
                CustomerId = customerId,
                RestaurantId = model.RestaurantId,
                TotalAmount = model.TotalAmount,
                OrderDate = DateTime.UtcNow,
                OrderStatus = OrderStatus.Pending
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Order created successfully.",
                OrderId = order.Id
            });
        }

        // =========================
        // GET ALL ORDERS (Admin Only)
        // =========================
        [HttpGet]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Restaurant)
                .Include(o => o.Customer)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    CustomerId = o.CustomerId,
                    RestaurantId = o.RestaurantId,
                    RestaurantName = o.Restaurant!.Name,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.OrderStatus.ToString()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // =========================
        // GET ORDER BY ID (With Ownership Check)
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole(Roles.Admin);

            var order = await _context.Orders
                .Include(o => o.Restaurant)
                .Include(o => o.Customer)
                .Where(o => o.Id == id)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    CustomerId = o.CustomerId,
                    RestaurantId = o.RestaurantId,
                    RestaurantName = o.Restaurant!.Name,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.OrderStatus.ToString()
                })
                .FirstOrDefaultAsync();

            if (order == null)
                return NotFound("Order not found.");

            // FIX: Prevent IDOR - Users can only view their own orders
            if (!isAdmin && order.CustomerId != currentUserId)
                return Forbid();

            return Ok(order);
        }

        // =========================
        // CUSTOMER ORDER HISTORY
        // =========================
        [HttpGet("history")]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> GetOrderHistory()
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var orders = await _context.Orders
                .Where(o => o.CustomerId == customerId)
                .Include(o => o.Restaurant)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderHistoryDto
                {
                    OrderId = o.Id,
                    RestaurantName = o.Restaurant!.Name,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.OrderStatus.ToString()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // =========================
        // CANCEL ORDER (With Refund Logic)
        // =========================
        [HttpPost("cancel/{orderId}")]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var order = await _context.Orders
                .Include(o => o.Payment)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == customerId);

            if (order == null)
                return NotFound("Order not found.");

            // FIX: State machine validation - Can only cancel if not yet out for delivery
            if (order.OrderStatus == OrderStatus.OutForDelivery ||
                order.OrderStatus == OrderStatus.Delivered)
            {
                return BadRequest("Order can no longer be cancelled as it is already out for delivery or delivered.");
            }

            if (order.OrderStatus == OrderStatus.Cancelled)
            {
                return BadRequest("Order is already cancelled.");
            }

            // FIX: If payment was made, initiate refund
            if (order.Payment != null && order.Payment.PaymentStatus == PaymentStatus.Paid)
            {
                var refundResult = await _paymentService.InitiateRefundAsync(
                    order.Payment,
                    "Customer requested cancellation"
                );

                if (refundResult.Success)
                {
                    // Note: Ensure 'Refunded' exists in your PaymentStatus enum. 
                    // If not, change this to PaymentStatus.Cancelled
                    order.Payment.PaymentStatus = PaymentStatus.Refunded; 
                    order.Payment.RefundReferenceId = refundResult.RefundReferenceId;
                }
                else
                {
                    return BadRequest($"Refund initiation failed: {refundResult.ErrorReason}");
                }
            }

            order.OrderStatus = OrderStatus.Cancelled;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Order cancelled successfully.",
                OrderId = order.Id,
                RefundInitiated = order.Payment?.PaymentStatus == PaymentStatus.Refunded
            });
        }

        // =========================
        // CHECKOUT (With Food Availability & Coupon Validation)
        // =========================
        [HttpPost("checkout")]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> Checkout(CheckoutDto model)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == model.RestaurantId);

            if (restaurant == null)
                return NotFound("Restaurant not found.");

            // Prevent checkout from suspended restaurants
            if (restaurant.IsSuspended)
            {
                return BadRequest(
                    $"This restaurant is currently suspended. " +
                    $"Reason: {restaurant.SuspensionReason ?? "Not specified"}"
                );
            }

            var cartItems = await _context.CartItems
                .Where(c => c.CustomerId == customerId && c.Food!.RestaurantId == model.RestaurantId)
                .Include(c => c.Food)
                .ToListAsync();

            if (!cartItems.Any())
                return BadRequest("Your cart is empty.");

            // FIX: Validate food availability and price before checkout
            foreach (var cartItem in cartItems)
            {
                if (cartItem.Food == null)
                    return BadRequest($"Food item not found in cart.");

                if (!cartItem.Food.IsAvailable)
                    return BadRequest($"'{cartItem.Food.Name}' is currently unavailable. Please remove it from your cart.");
            }

            decimal totalAmount = cartItems.Sum(c => c.Food!.Price * c.Quantity);

            // ==========================================
            // APPLY COUPON DISCOUNT (SECURE BACKEND LOGIC)
            // ==========================================
            if (!string.IsNullOrWhiteSpace(model.CouponCode))
            {
                var today = DateTime.UtcNow;
                var offer = await _context.Offers
                    .FirstOrDefaultAsync(o =>
                        o.CouponCode == model.CouponCode.ToUpper() &&
                        o.IsActive &&
                        o.StartDate <= today &&
                        o.EndDate >= today &&
                        (o.RestaurantId == null || o.RestaurantId == model.RestaurantId)
                    );

                if (offer != null)
                {
                    decimal discountAmount = totalAmount * (offer.DiscountPercentage / 100);
                    if (offer.MaximumDiscount.HasValue && offer.MaximumDiscount.Value > 0 && discountAmount > offer.MaximumDiscount.Value)
                    {
                        discountAmount = offer.MaximumDiscount.Value;
                    }
                    totalAmount -= discountAmount;
                    if (totalAmount < 0) totalAmount = 0;
                }
            }

            var order = new Order
            {
                CustomerId = customerId,
                RestaurantId = model.RestaurantId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = totalAmount,
                DeliveryAddress = model.DeliveryAddress,
                OrderStatus = OrderStatus.Pending
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            foreach (var cartItem in cartItems)
            {
                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    FoodId = cartItem.FoodId,
                    Quantity = cartItem.Quantity,
                    Price = cartItem.Food!.Price
                };

                _context.OrderItems.Add(orderItem);
            }

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Checkout completed successfully.",
                OrderId = order.Id,
                Restaurant = restaurant.Name,
                TotalItems = cartItems.Count,
                TotalAmount = order.TotalAmount,
                Status = order.OrderStatus.ToString()
            });
        }

        // =========================
        // UPDATE ORDER STATUS (Admin/Restaurant/Rider)
        // =========================
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, UpdateOrderStatusDto model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole(Roles.Admin);

            var order = await _context.Orders
                .Include(o => o.Restaurant)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound("Order not found.");

            if (model == null || string.IsNullOrWhiteSpace(model.Status))
                return BadRequest("Order status is required.");

            if (!Enum.TryParse<OrderStatus>(model.Status, true, out var newStatus))
                return BadRequest($"Invalid order status: '{model.Status}'.");

            // FIX: Validate state transitions
            var validTransition = ValidateStatusTransition(order.OrderStatus, newStatus, isAdmin, currentUserId, order);

            if (!validTransition)
            {
                return BadRequest($"Cannot change order status from '{order.OrderStatus}' to '{newStatus}'.");
            }

            order.OrderStatus = newStatus;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Order status updated successfully.",
                OrderId = order.Id,
                NewStatus = order.OrderStatus.ToString()
            });
        }

        // =========================
        // HELPER: Validate Status Transition
        // =========================
        private bool ValidateStatusTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus,
            bool isAdmin,
            string currentUserId,
            Order order)
        {
            // Admin can override any status
            if (isAdmin)
                return true;

            // Standard state machine flow
            return (currentStatus == OrderStatus.Pending && newStatus == OrderStatus.Accepted) ||
                   (currentStatus == OrderStatus.Accepted && newStatus == OrderStatus.Preparing) ||
                   (currentStatus == OrderStatus.Preparing && newStatus == OrderStatus.ReadyForPickup) ||
                   (currentStatus == OrderStatus.ReadyForPickup && newStatus == OrderStatus.OutForDelivery) ||
                   (currentStatus == OrderStatus.OutForDelivery && newStatus == OrderStatus.Delivered) ||
                   (currentStatus != OrderStatus.Delivered && newStatus == OrderStatus.Cancelled);
        }
    }
}