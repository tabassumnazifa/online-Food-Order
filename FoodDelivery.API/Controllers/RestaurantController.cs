
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
    [Authorize(Roles = Roles.RestaurantOwner)]
    public class RestaurantController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RestaurantController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================
        // CREATE RESTAURANT
        // =========================
        [HttpPost("create")]
        public async Task<IActionResult> CreateRestaurant(
            CreateRestaurantDto model)
        {
            var ownerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var existingRestaurant = await _context.Restaurants
                .AnyAsync(r => r.OwnerId == ownerId);

            if (existingRestaurant)
            {
                return BadRequest(
                    "You have already created a restaurant.");
            }

            var restaurant = new Restaurant
            {
                Name = model.Name,
                Description = model.Description,
                Address = model.Address,
                Phone = model.Phone,
                OwnerId = ownerId
            };

            _context.Restaurants.Add(restaurant);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Restaurant created successfully."
            });
        }

        // =========================
        // UPDATE RESTAURANT
        // =========================
        [HttpPut("update")]
        public async Task<IActionResult> UpdateRestaurant(
            UpdateRestaurantDto model)
        {
            var ownerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.OwnerId == ownerId);

            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }

            restaurant.Name = model.Name;
            restaurant.Description = model.Description;
            restaurant.Address = model.Address;
            restaurant.Phone = model.Phone;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Restaurant updated successfully."
            });
        }

        // =========================
        // MY RESTAURANT
        // =========================
        [HttpGet("my-restaurant")]
        public async Task<IActionResult> GetMyRestaurant()
        {
            var ownerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var restaurant = await _context.Restaurants
                .Where(r => r.OwnerId == ownerId)
                .Select(r => new MyRestaurantDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Address = r.Address,
                    Phone = r.Phone
                })
                .FirstOrDefaultAsync();

            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }

            return Ok(restaurant);
        }

        // =========================
        // GET ALL RESTAURANTS
        // PUBLIC CUSTOMER ENDPOINT
        // =========================
        [AllowAnonymous]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllRestaurants()
        {
            var restaurants = await _context.Restaurants
                .Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Description,
                    r.Address,
                    r.Phone,
                    r.IsSuspended,
                    r.SuspensionReason,
                    r.SuspendedAt,

                    Rating = _context.Feedbacks
                        .Where(f => f.RestaurantId == r.Id)
                        .Select(f => (double?)f.Rating)
                        .Average() ?? 0
                })
                .ToListAsync();

            return Ok(restaurants);
        }

        // =========================
        // RESTAURANT DASHBOARD
        // =========================
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var ownerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.OwnerId == ownerId);

            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }

            var dashboard = new RestaurantDashboardDto
            {
                RestaurantName = restaurant.Name,

                TotalFoods = await _context.Foods
                    .CountAsync(f =>
                        f.RestaurantId == restaurant.Id),

                TotalOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RestaurantId == restaurant.Id),

                PendingOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RestaurantId == restaurant.Id &&
                        o.OrderStatus == OrderStatus.Pending),

                CompletedOrders = await _context.Orders
                    .CountAsync(o =>
                        o.RestaurantId == restaurant.Id &&
                        o.OrderStatus == OrderStatus.Delivered),

                TotalRevenue = await _context.Orders
                    .Where(o =>
                        o.RestaurantId == restaurant.Id &&
                        o.OrderStatus == OrderStatus.Delivered)
                    .SumAsync(o =>
                        (decimal?)o.TotalAmount) ?? 0
            };

            return Ok(dashboard);
        }

        // =========================
        // MY RESTAURANT ORDERS
        // =========================
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var ownerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.OwnerId == ownerId);

            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }

            var orders = await _context.Orders
                .Where(o =>
                    o.RestaurantId == restaurant.Id)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new RestaurantOrderDto
                {
                    OrderId = o.Id,
                    CustomerId = o.CustomerId,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.OrderStatus.ToString()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // =========================
        // UPDATE ORDER STATUS
        // =========================
        [HttpPut("update-order-status/{orderId}")]
        public async Task<IActionResult> UpdateOrderStatus(
            int orderId,
            UpdateOrderStatusDto model)
        {
            var ownerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.OwnerId == ownerId);

            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o =>
                    o.Id == orderId &&
                    o.RestaurantId == restaurant.Id);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            if (model == null || string.IsNullOrWhiteSpace(model.Status))
            {
                return BadRequest("Order status is required.");
            }

            if (!Enum.TryParse<OrderStatus>(
                    model.Status,
                    true,
                    out var newStatus))
            {
                return BadRequest(
                    $"Invalid order status: '{model.Status}'.");
            }

            // =========================
            // RESTAURANT STATUS FLOW
            // =========================
            //
            // Pending
            //    ↓
            // Accepted
            //    ↓
            // Preparing
            //    ↓
            // ReadyForPickup
            //
            // After ReadyForPickup, the
            // delivery rider handles the rest.
            // =========================

            var validTransition =
                (order.OrderStatus == OrderStatus.Pending &&
                 newStatus == OrderStatus.Accepted) ||

                (order.OrderStatus == OrderStatus.Accepted &&
                 newStatus == OrderStatus.Preparing) ||

                (order.OrderStatus == OrderStatus.Preparing &&
                 newStatus == OrderStatus.ReadyForPickup);

            if (!validTransition)
            {
                return BadRequest(
                    $"Cannot change restaurant order status " +
                    $"from '{order.OrderStatus}' to '{newStatus}'.");
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
    }
}
