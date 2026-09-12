using System;
using System.Security.Claims;
using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Enums;
using FoodDelivery.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                AvailableOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RiderId == null &&
                        o.OrderStatus == OrderStatus.ReadyForPickup),

                ActiveOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RiderId == riderId &&
                        o.OrderStatus != OrderStatus.Delivered &&
                        o.OrderStatus != OrderStatus.Cancelled),

                CompletedOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RiderId == riderId &&
                        o.OrderStatus == OrderStatus.Delivered),

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

            if (order.RiderId != null)
            {
                return BadRequest(
                    "This order is already assigned to another rider."
                );
            }

            if (order.OrderStatus != OrderStatus.ReadyForPickup)
            {
                return BadRequest(
                    "This order is not ready for pickup."
                );
            }

            order.RiderId = riderId;
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

            // Include the Payment entity so we can update it if it's COD
            var order = await _context.Orders
                .Include(o => o.Payment) 
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

            // Automatically mark Cash on Delivery payments as Paid upon delivery
            if (newStatus == OrderStatus.Delivered && order.Payment != null)
            {
                if (order.Payment.PaymentMethod == PaymentMethod.CashOnDelivery)
                {
                    order.Payment.PaymentStatus = PaymentStatus.Paid;
                    order.Payment.PaymentDate = DateTime.UtcNow;
                }
            }

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