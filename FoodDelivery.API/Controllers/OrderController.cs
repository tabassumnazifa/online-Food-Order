using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Enums;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
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

        public OrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================
        // CREATE ORDER
        // =========================
        [HttpPost("create")]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> CreateOrder(CreateOrderDto model)
        {
            var customerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == model.RestaurantId);

            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }

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
                Status = "Pending"
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
        // GET ALL ORDERS
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Restaurant)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    CustomerId = o.CustomerId,
                    RestaurantId = o.RestaurantId,
                    RestaurantName = o.Restaurant!.Name,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status
                })
                .ToListAsync();

            return Ok(orders);
        }

        // =========================
        // GET ORDER BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Restaurant)
                .Where(o => o.Id == id)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    CustomerId = o.CustomerId,
                    RestaurantId = o.RestaurantId,
                    RestaurantName = o.Restaurant!.Name,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status
                })
                .FirstOrDefaultAsync();

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            return Ok(order);
        }

        // =========================
        // CUSTOMER ORDER HISTORY
        // =========================
        [HttpGet("history")]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> GetOrderHistory()
        {
            var customerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

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
                    Status = o.Status
                })
                .ToListAsync();

            return Ok(orders);
        }

        // =========================
        // UPDATE ORDER STATUS
        // =========================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(
            int id,
            UpdateOrderDto model)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            order.Status = model.Status;

            await _context.SaveChangesAsync();

            return Ok("Order updated successfully.");
        }

        // =========================
        // DELETE ORDER
        // =========================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            _context.Orders.Remove(order);

            await _context.SaveChangesAsync();

            return Ok("Order deleted successfully.");
        }

        // =========================
        // CHECKOUT
        // =========================
        [HttpPost("checkout")]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> Checkout(CheckoutDto model)
        {
            var customerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == model.RestaurantId);

            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }

            // Prevent checkout from suspended restaurants
            if (restaurant.IsSuspended)
            {
                return BadRequest(
                    $"This restaurant is currently suspended. " +
                    $"Reason: {restaurant.SuspensionReason ?? "Not specified"}"
                );
            }

            var cartItems = await _context.CartItems
                .Where(c =>
                    c.CustomerId == customerId &&
                    c.Food!.RestaurantId == model.RestaurantId)
                .Include(c => c.Food)
                .ToListAsync();

            if (!cartItems.Any())
            {
                return BadRequest("Your cart is empty.");
            }

            decimal totalAmount = cartItems.Sum(
                c => c.Food!.Price * c.Quantity);

            var order = new Order
            {
                CustomerId = customerId,
                RestaurantId = model.RestaurantId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = totalAmount,
                Status = "Placed"
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
                Status = order.Status
            });
        }
    }
}
