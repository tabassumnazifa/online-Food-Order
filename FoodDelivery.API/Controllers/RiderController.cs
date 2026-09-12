
using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Enums;
using FoodDelivery.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FoodDelivery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.DeliveryRider)]
    public class RiderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RiderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================
        // RIDER DASHBOARD
        // =========================

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var riderId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (string.IsNullOrEmpty(riderId))
            {
                return Unauthorized();
            }

            var dashboard = new RiderDashboardDto
            {
                // Orders waiting for a rider
                AvailableOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RiderId == null &&
                        o.OrderStatus == OrderStatus.ReadyForPickup),

                // Rider's active deliveries
                ActiveOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RiderId == riderId &&
                        o.OrderStatus != OrderStatus.Delivered &&
                        o.OrderStatus != OrderStatus.Cancelled),

                // Completed deliveries
                CompletedOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RiderId == riderId &&
                        o.OrderStatus == OrderStatus.Delivered),

                // Total deliveries
                TotalDeliveries = await _context.Orders
                    .CountAsync(o =>
                        o.RiderId == riderId &&
                        o.OrderStatus == OrderStatus.Delivered)
            };

            return Ok(dashboard);
        }

        // =========================
        // AVAILABLE ORDERS
        // =========================

        [HttpGet("available-orders")]
        public async Task<IActionResult> GetAvailableOrders()
        {
            var orders = await _context.Orders
                .Where(o =>
                    o.RiderId == null &&
                    o.OrderStatus == OrderStatus.ReadyForPickup)
                .Include(o => o.Restaurant)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new AvailableOrderDto
                {
                    OrderId = o.Id,
                    RestaurantName = o.Restaurant!.Name,
                    RestaurantAddress = o.Restaurant.Address,
                    TotalAmount = o.TotalAmount,
                    Status = o.OrderStatus.ToString(),
                    OrderDate = o.OrderDate
                })
                .ToListAsync();

            return Ok(orders);
        }

        // =========================
        // RIDER ACCEPTS DELIVERY
        // =========================

        [HttpPut("accept-order/{orderId}")]
        public async Task<IActionResult> AcceptOrder(int orderId)
        {
            var riderId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (string.IsNullOrEmpty(riderId))
            {
                return Unauthorized();
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            // Make sure another rider has not already taken it
            if (order.RiderId != null)
            {
                return BadRequest(
                    "This order is already assigned to another rider."
                );
            }

            // Rider can only accept orders that are
            // ready for pickup.
            if (order.OrderStatus != OrderStatus.ReadyForPickup)
            {
                return BadRequest(
                    "This order is not ready for pickup."
                );
            }

            // Assign the order to this rider
            order.RiderId = riderId;

            // Once rider accepts the delivery,
            // the order is now out for delivery.
            order.OrderStatus = OrderStatus.OutForDelivery;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Delivery accepted successfully.",
                OrderId = order.Id,
                Status = order.OrderStatus.ToString()
            });
        }

        // =========================
        // MY ASSIGNED ORDERS
        // =========================

        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var riderId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (string.IsNullOrEmpty(riderId))
            {
                return Unauthorized();
            }

            var orders = await _context.Orders
                .Where(o => o.RiderId == riderId)
                .Include(o => o.Restaurant)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new RiderOrderDto
                {
                    OrderId = o.Id,
                    RestaurantName = o.Restaurant!.Name,
                    RestaurantAddress = o.Restaurant.Address,
                    TotalAmount = o.TotalAmount,
                    Status = o.OrderStatus.ToString(),
                    OrderDate = o.OrderDate
                })
                .ToListAsync();

            return Ok(orders);
        }

        // =========================
        // UPDATE DELIVERY STATUS
        // =========================

        [HttpPut("update-delivery-status/{orderId}")]
        public async Task<IActionResult> UpdateDeliveryStatus(
            int orderId,
            UpdateDeliveryStatusDto model)
        {
            var riderId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (string.IsNullOrEmpty(riderId))
            {
                return Unauthorized();
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o =>
                    o.Id == orderId &&
                    o.RiderId == riderId);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            if (model == null ||
                string.IsNullOrWhiteSpace(model.Status))
            {
                return BadRequest(
                    "Delivery status is required."
                );
            }

            if (!Enum.TryParse<OrderStatus>(
                model.Status,
                true,
                out var newStatus))
            {
                return BadRequest(
                    $"Invalid delivery status: '{model.Status}'."
                );
            }

            // =========================
            // RIDER DELIVERY FLOW
            // =========================
            //
            // OutForDelivery
            //       ↓
            // Delivered
            //
            // The restaurant controls:
            //
            // Pending
            //       ↓
            // Accepted
            //       ↓
            // Preparing
            //       ↓
            // ReadyForPickup
            //
            // The rider controls:
            //
            // ReadyForPickup
            //       ↓
            // OutForDelivery
            //       ↓
            // Delivered
            // =========================

            var validTransition =
                order.OrderStatus == OrderStatus.OutForDelivery &&
                newStatus == OrderStatus.Delivered;

            if (!validTransition)
            {
                return BadRequest(
                    $"Cannot change status from '{order.OrderStatus}' to '{newStatus}'."
                );
            }

            order.OrderStatus = newStatus;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Delivery status updated successfully.",
                OrderId = order.Id,
                NewStatus = order.OrderStatus.ToString()
            });
        }
    }
}
