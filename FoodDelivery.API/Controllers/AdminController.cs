using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Enums;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Admin)]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // =========================
        // ADMIN DASHBOARD
        // =========================
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var customers = await _userManager.GetUsersInRoleAsync(Roles.Customer);
            var restaurantOwners = await _userManager.GetUsersInRoleAsync(Roles.RestaurantOwner);
            var deliveryRiders = await _userManager.GetUsersInRoleAsync(Roles.DeliveryRider);

            var totalRevenue = await _context.Payments
                .Where(p => p.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(p => (decimal?)p.Amount) ?? 0;

            var dashboard = new AdminDashboardDto
            {
                TotalCustomers = customers.Count,
                TotalRestaurantOwners = restaurantOwners.Count,
                TotalDeliveryRiders = deliveryRiders.Count,
                TotalRestaurants = await _context.Restaurants.CountAsync(),
                TotalFoods = await _context.Foods.CountAsync(),
                TotalOrders = await _context.Orders.CountAsync(),
                TotalRevenue = totalRevenue
            };

            return Ok(dashboard);
        }

        // =========================
        // GET ALL CUSTOMERS
        // =========================
        [HttpGet("customers")]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _userManager.GetUsersInRoleAsync(Roles.Customer);

            var customerList = customers
                .Select(customer => new CustomerListDto
                {
                    Id = customer.Id,
                    FullName = customer.FullName,
                    Email = customer.Email ?? string.Empty,
                    PhoneNumber = customer.PhoneNumber
                })
                .OrderBy(customer => customer.FullName)
                .ToList();

            return Ok(customerList);
        }

        // =========================
        // GET ALL RESTAURANT OWNERS
        // =========================
        [HttpGet("restaurant-owners")]
        public async Task<IActionResult> GetAllRestaurantOwners()
        {
            var restaurantOwners = await _userManager.GetUsersInRoleAsync(Roles.RestaurantOwner);

            var ownerList = restaurantOwners
                .Select(owner => new RestaurantOwnerListDto
                {
                    Id = owner.Id,
                    FullName = owner.FullName,
                    Email = owner.Email ?? string.Empty,
                    PhoneNumber = owner.PhoneNumber
                })
                .OrderBy(owner => owner.FullName)
                .ToList();

            return Ok(ownerList);
        }

        // =========================
        // GET ALL DELIVERY RIDERS
        // =========================
        [HttpGet("delivery-riders")]
        public async Task<IActionResult> GetAllDeliveryRiders()
        {
            var deliveryRiders = await _userManager.GetUsersInRoleAsync(Roles.DeliveryRider);

            var riderList = deliveryRiders
                .Select(rider => new DeliveryRiderListDto
                {
                    Id = rider.Id,
                    FullName = rider.FullName,
                    Email = rider.Email ?? string.Empty,
                    PhoneNumber = rider.PhoneNumber
                })
                .OrderBy(rider => rider.FullName)
                .ToList();

            return Ok(riderList);
        }

        // =========================
        // GET ALL RESTAURANTS
        // =========================
        [HttpGet("restaurants")]
        public async Task<IActionResult> GetAllRestaurants()
        {
            var restaurants = await _context.Restaurants
                .Include(r => r.Owner)
                .Include(r => r.Foods)
                .Include(r => r.Feedbacks)
                .OrderBy(r => r.Name)
                .Select(r => new RestaurantListDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Address = r.Address ?? string.Empty,
                    OwnerName = r.Owner != null
                        ? r.Owner.FullName
                        : string.Empty,
                    TotalFoods = r.Foods.Count,
                    AverageRating = r.Feedbacks.Any()
                        ? Math.Round(r.Feedbacks.Average(f => (double)f.Rating), 1)
                        : 0
                })
                .ToListAsync();

            return Ok(restaurants);
        }
    }
}