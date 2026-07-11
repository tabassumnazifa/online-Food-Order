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
            var riderId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(riderId))
            {
                return Unauthorized();
            }


            var dashboard = new RiderDashboardDto
            {
                AvailableOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RiderId == null &&
                        o.Status == "Placed"),


                ActiveOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RiderId == riderId &&
                        o.Status != "Delivered"),


                CompletedOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RiderId == riderId &&
                        o.Status == "Delivered"),


                TotalDeliveries = await _context.Orders
                    .CountAsync(o =>
                        o.RiderId == riderId &&
                        o.Status == "Delivered")
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
                    o.Status == "Placed")
                .Include(o => o.Restaurant)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new AvailableOrderDto
                {
                    OrderId = o.Id,
                    RestaurantName = o.Restaurant!.Name,
                    RestaurantAddress = o.Restaurant.Address,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    OrderDate = o.OrderDate
                })
                .ToListAsync();


            return Ok(orders);
        }



        // =========================
        // ACCEPT ORDER
        // =========================
        [HttpPut("accept-order/{orderId}")]
        public async Task<IActionResult> AcceptOrder(int orderId)
        {
            var riderId = User.FindFirstValue(ClaimTypes.NameIdentifier);

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
                return BadRequest("This order is already assigned.");
            }


            if (order.Status != "Placed")
            {
                return BadRequest("This order is not available.");
            }


            order.RiderId = riderId;
            order.Status = "Accepted";


            await _context.SaveChangesAsync();


            return Ok(new
            {
                Message = "Order accepted successfully.",
                OrderId = order.Id,
                Status = order.Status
            });
        }



        // =========================
        // MY ASSIGNED ORDERS
        // =========================
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var riderId = User.FindFirstValue(ClaimTypes.NameIdentifier);

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
                    Status = o.Status,
                    OrderDate = o.OrderDate
                })
                .ToListAsync();


            return Ok(orders);
        }
    }
}