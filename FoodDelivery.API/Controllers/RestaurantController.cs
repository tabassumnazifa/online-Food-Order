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
        public async Task<IActionResult> CreateRestaurant(CreateRestaurantDto model)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var existingRestaurant = await _context.Restaurants
                .AnyAsync(r => r.OwnerId == ownerId);

            if (existingRestaurant)
            {
                return BadRequest("You have already created a restaurant.");
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
        public async Task<IActionResult> UpdateRestaurant(UpdateRestaurantDto model)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

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
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

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
        // RESTAURANT DASHBOARD
        // =========================
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

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
                    .CountAsync(f => f.RestaurantId == restaurant.Id),

                TotalCategories = await _context.Foods
                    .Where(f => f.RestaurantId == restaurant.Id)
                    .Select(f => f.CategoryId)
                    .Distinct()
                    .CountAsync(),

                TotalOrders = await _context.Orders
                    .CountAsync(o => o.RestaurantId == restaurant.Id),

                PendingOrders = await _context.Orders
                    .CountAsync(o => o.RestaurantId == restaurant.Id &&
                                     o.Status == "Placed"),

                CompletedOrders = await _context.Orders
                    .CountAsync(o => o.RestaurantId == restaurant.Id &&
                                     o.Status == "Delivered"),

                TotalRevenue = await _context.Orders
                    .Where(o => o.RestaurantId == restaurant.Id &&
                                o.Status == "Delivered")
                    .SumAsync(o => (decimal?)o.TotalAmount) ?? 0
            };

            return Ok(dashboard);
        }

        // =========================
        // MY RESTAURANT ORDERS
        // =========================
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.OwnerId == ownerId);

            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }

            var orders = await _context.Orders
                .Where(o => o.RestaurantId == restaurant.Id)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new RestaurantOrderDto
                {
                    OrderId = o.Id,
                    CustomerId = o.CustomerId,
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
        [HttpPut("update-order-status/{orderId}")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, UpdateOrderStatusDto model)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

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

            order.Status = model.Status;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Order status updated successfully.",
                OrderId = order.Id,
                NewStatus = order.Status
            });
        }

        // =========================
// GET ALL RESTAURANTS (PUBLIC)
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
            r.Phone
        })
        .ToListAsync();

    return Ok(restaurants);
}
    }
}