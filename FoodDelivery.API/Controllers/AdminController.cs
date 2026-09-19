using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Enums;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Text.Json;

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


        // =====================================================
        // ADMIN DASHBOARD
        // =====================================================

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


        // =====================================================
        // GET ALL CUSTOMERS
        // =====================================================

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
                    PhoneNumber = customer.PhoneNumber,
                    IsActive = customer.IsActive
                })
                .OrderBy(customer => customer.FullName)
                .ToList();

            return Ok(customerList);
        }


        // =====================================================
        // GET ALL RESTAURANT OWNERS
        // =====================================================

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
                    PhoneNumber = owner.PhoneNumber,
                    IsActive = owner.IsActive
                })
                .OrderBy(owner => owner.FullName)
                .ToList();

            return Ok(ownerList);
        }


        // =====================================================
        // GET ALL DELIVERY RIDERS
        // =====================================================

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
                    PhoneNumber = rider.PhoneNumber,
                    IsActive = rider.IsActive
                })
                .OrderBy(rider => rider.FullName)
                .ToList();

            return Ok(riderList);
        }


        // =====================================================
        // BLOCK CUSTOMER
        // =====================================================

        [HttpPut("customers/{id}/block")]
        public async Task<IActionResult> BlockCustomer(string id)
        {
            var customer = await _userManager.FindByIdAsync(id);
            if (customer == null) return NotFound("Customer not found.");

            var isCustomer = await _userManager.IsInRoleAsync(customer, Roles.Customer);
            if (!isCustomer) return BadRequest("The specified user is not a customer.");
            if (!customer.IsActive) return BadRequest("Customer is already blocked.");

            customer.IsActive = false;
            await _userManager.UpdateAsync(customer);

            return Ok(new { Message = "Customer blocked successfully.", UserId = customer.Id, IsActive = customer.IsActive });
        }


        // =====================================================
        // UNBLOCK CUSTOMER
        // =====================================================

        [HttpPut("customers/{id}/unblock")]
        public async Task<IActionResult> UnblockCustomer(string id)
        {
            var customer = await _userManager.FindByIdAsync(id);
            if (customer == null) return NotFound("Customer not found.");

            var isCustomer = await _userManager.IsInRoleAsync(customer, Roles.Customer);
            if (!isCustomer) return BadRequest("The specified user is not a customer.");
            if (customer.IsActive) return BadRequest("Customer is already active.");

            customer.IsActive = true;
            await _userManager.UpdateAsync(customer);

            return Ok(new { Message = "Customer unblocked successfully.", UserId = customer.Id, IsActive = customer.IsActive });
        }


        // =====================================================
        // BLOCK RESTAURANT OWNER
        // =====================================================

        [HttpPut("restaurant-owners/{id}/block")]
        public async Task<IActionResult> BlockRestaurantOwner(string id)
        {
            var owner = await _userManager.FindByIdAsync(id);
            if (owner == null) return NotFound("Restaurant owner not found.");

            var isRestaurantOwner = await _userManager.IsInRoleAsync(owner, Roles.RestaurantOwner);
            if (!isRestaurantOwner) return BadRequest("The specified user is not a restaurant owner.");
            if (!owner.IsActive) return BadRequest("Restaurant owner is already blocked.");

            owner.IsActive = false;
            await _userManager.UpdateAsync(owner);

            return Ok(new { Message = "Restaurant owner blocked successfully.", UserId = owner.Id, IsActive = owner.IsActive });
        }


        // =====================================================
        // UNBLOCK RESTAURANT OWNER
        // =====================================================

        [HttpPut("restaurant-owners/{id}/unblock")]
        public async Task<IActionResult> UnblockRestaurantOwner(string id)
        {
            var owner = await _userManager.FindByIdAsync(id);
            if (owner == null) return NotFound("Restaurant owner not found.");

            var isRestaurantOwner = await _userManager.IsInRoleAsync(owner, Roles.RestaurantOwner);
            if (!isRestaurantOwner) return BadRequest("The specified user is not a restaurant owner.");
            if (owner.IsActive) return BadRequest("Restaurant owner is already active.");

            owner.IsActive = true;
            await _userManager.UpdateAsync(owner);

            return Ok(new { Message = "Restaurant owner unblocked successfully.", UserId = owner.Id, IsActive = owner.IsActive });
        }


        // =====================================================
        // BLOCK DELIVERY RIDER
        // =====================================================

        [HttpPut("delivery-riders/{id}/block")]
        public async Task<IActionResult> BlockDeliveryRider(string id)
        {
            var rider = await _userManager.FindByIdAsync(id);
            if (rider == null) return NotFound("Delivery rider not found.");

            var isDeliveryRider = await _userManager.IsInRoleAsync(rider, Roles.DeliveryRider);
            if (!isDeliveryRider) return BadRequest("The specified user is not a delivery rider.");
            if (!rider.IsActive) return BadRequest("Delivery rider is already blocked.");

            rider.IsActive = false;
            await _userManager.UpdateAsync(rider);

            return Ok(new { Message = "Delivery rider blocked successfully.", UserId = rider.Id, IsActive = rider.IsActive });
        }


        // =====================================================
        // UNBLOCK DELIVERY RIDER
        // =====================================================

        [HttpPut("delivery-riders/{id}/unblock")]
        public async Task<IActionResult> UnblockDeliveryRider(string id)
        {
            var rider = await _userManager.FindByIdAsync(id);
            if (rider == null) return NotFound("Delivery rider not found.");

            var isDeliveryRider = await _userManager.IsInRoleAsync(rider, Roles.DeliveryRider);
            if (!isDeliveryRider) return BadRequest("The specified user is not a delivery rider.");
            if (rider.IsActive) return BadRequest("Delivery rider is already active.");

            rider.IsActive = true;
            await _userManager.UpdateAsync(rider);

            return Ok(new { Message = "Delivery rider unblocked successfully.", UserId = rider.Id, IsActive = rider.IsActive });
        }


        // =====================================================
        // GET ALL RESTAURANTS (FIXED TO INCLUDE DOCUMENT URLS)
        // =====================================================

        [HttpGet("restaurants")]
        public async Task<IActionResult> GetAllRestaurants()
        {
            var uploadsFolder = Path.Combine(
                Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            // 1. Fetch all restaurants from the database
            var restaurants = await _context.Restaurants
                .Include(r => r.Owner)
                .Include(r => r.Foods)
                .Include(r => r.Feedbacks)
                .OrderBy(r => r.Name)
                .ToListAsync();

            var result = new List<object>();

            // 2. Loop through each restaurant to check for uploaded documents
            foreach (var r in restaurants)
            {
                string? nidUrl = null;
                string? licenseUrl = null;

                var markerPath = Path.Combine(uploadsFolder, $"rest_{r.Id}_docs.json");

                // If the marker file exists, read the filenames and build the URLs
                if (System.IO.File.Exists(markerPath))
                {
                    var json = await System.IO.File.ReadAllTextAsync(markerPath);
                    using var doc = JsonDocument.Parse(json);

                    var nidFile = doc.RootElement.GetProperty("nid").GetString();
                    var licenseFile = doc.RootElement.GetProperty("license").GetString();

                    nidUrl = $"/uploads/{nidFile}";
                    licenseUrl = $"/uploads/{licenseFile}";
                }

                // 3. Add the restaurant data + document URLs to the result list
                result.Add(new
                {
                    r.Id,
                    r.Name,
                    Address = r.Address ?? string.Empty,
                    Phone = r.Phone ?? string.Empty,
                    ImageUrl = r.ImageUrl,
                    OwnerName = r.Owner?.FullName ?? string.Empty,
                    TotalFoods = r.Foods.Count,
                    AverageRating = r.Feedbacks.Any() 
                        ? Math.Round(r.Feedbacks.Average(f => (double)f.Rating), 1) 
                        : 0,
                    r.IsSuspended,
                    r.SuspensionReason,
                    r.SuspendedAt,
                    NidDocumentUrl = nidUrl,
                    TradeLicenseUrl = licenseUrl
                });
            }

            return Ok(result);
        }


        // =====================================================
        // GET RESTAURANT DETAILS
        // =====================================================

        [HttpGet("restaurants/{id}")]
        public async Task<IActionResult> GetRestaurantDetails(int id)
        {
            var restaurant = await _context.Restaurants
                .Include(r => r.Owner)
                .Include(r => r.Foods)
                .Include(r => r.Feedbacks)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (restaurant == null) return NotFound("Restaurant not found.");

            var restaurantDetails = new RestaurantDetailsDto
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Description = restaurant.Description,
                Address = restaurant.Address,
                Phone = restaurant.Phone,
                OwnerName = restaurant.Owner?.FullName ?? string.Empty,
                TotalFoods = restaurant.Foods.Count,
                TotalFeedbacks = restaurant.Feedbacks.Count,
                AverageRating = restaurant.Feedbacks.Any() 
                    ? Math.Round(restaurant.Feedbacks.Average(f => (double)f.Rating), 1) 
                    : 0
            };

            return Ok(restaurantDetails);
        }


        // =====================================================
        // SUSPEND RESTAURANT
        // =====================================================

        [HttpPut("restaurants/{id}/suspend")]
        public async Task<IActionResult> SuspendRestaurant(int id, [FromBody] string reason)
        {
            var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == id);
            if (restaurant == null) return NotFound("Restaurant not found.");
            if (restaurant.IsSuspended) return BadRequest("Restaurant is already suspended.");
            if (string.IsNullOrWhiteSpace(reason)) return BadRequest("Suspension reason is required.");

            restaurant.IsSuspended = true;
            restaurant.SuspensionReason = reason.Trim();
            restaurant.SuspendedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Restaurant suspended successfully.",
                RestaurantId = restaurant.Id,
                IsSuspended = restaurant.IsSuspended,
                SuspensionReason = restaurant.SuspensionReason,
                SuspendedAt = restaurant.SuspendedAt
            });
        }


        // =====================================================
        // UNSUSPEND RESTAURANT
        // =====================================================

        [HttpPut("restaurants/{id}/unsuspend")]
        public async Task<IActionResult> UnsuspendRestaurant(int id)
        {
            var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == id);
            if (restaurant == null) return NotFound("Restaurant not found.");
            if (!restaurant.IsSuspended) return BadRequest("Restaurant is not suspended.");

            restaurant.IsSuspended = false;
            restaurant.SuspensionReason = null;
            restaurant.SuspendedAt = null;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Restaurant unsuspended successfully.",
                RestaurantId = restaurant.Id,
                IsSuspended = restaurant.IsSuspended
            });
        }


        // =====================================================
        // GET ALL ORDERS
        // =====================================================

        [HttpGet("orders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.Restaurant)
                .Include(o => o.Rider)
                .Include(o => o.Payment)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderListDto
                {
                    Id = o.Id,
                    CustomerName = o.Customer != null ? o.Customer.FullName : string.Empty,
                    RestaurantName = o.Restaurant != null ? o.Restaurant.Name : string.Empty,
                    RiderName = o.Rider != null ? o.Rider.FullName : "Not Assigned",
                    TotalAmount = o.TotalAmount,
                    OrderStatus = o.OrderStatus,
                    PaymentStatus = o.Payment != null ? o.Payment.PaymentStatus : PaymentStatus.Pending,
                    OrderDate = o.OrderDate
                })
                .ToListAsync();

            return Ok(orders);
        }


        // =====================================================
        // GET ORDER DETAILS
        // =====================================================

        [HttpGet("orders/{id}")]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.Restaurant)
                .Include(o => o.Rider)
                .Include(o => o.Payment)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound("Order not found.");

            var orderDetails = new OrderDetailsDto
            {
                Id = order.Id,
                CustomerName = order.Customer?.FullName ?? string.Empty,
                RestaurantName = order.Restaurant?.Name ?? string.Empty,
                RiderName = order.Rider?.FullName ?? "Not Assigned",
                TotalAmount = order.TotalAmount,
                DeliveryAddress = order.DeliveryAddress,
                OrderStatus = order.OrderStatus,
                PaymentStatus = order.Payment?.PaymentStatus ?? PaymentStatus.Pending,
                OrderDate = order.OrderDate
            };

            return Ok(orderDetails);
        }


        // =====================================================
        // GET ORDERS BY STATUS
        // =====================================================

        [HttpGet("orders/status/{status}")]
        public async Task<IActionResult> GetOrdersByStatus(OrderStatus status)
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.Restaurant)
                .Include(o => o.Rider)
                .Include(o => o.Payment)
                .Where(o => o.OrderStatus == status)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderListDto
                {
                    Id = o.Id,
                    CustomerName = o.Customer != null ? o.Customer.FullName : string.Empty,
                    RestaurantName = o.Restaurant != null ? o.Restaurant.Name : string.Empty,
                    RiderName = o.Rider != null ? o.Rider.FullName : "Not Assigned",
                    TotalAmount = o.TotalAmount,
                    OrderStatus = o.OrderStatus,
                    PaymentStatus = o.Payment != null ? o.Payment.PaymentStatus : PaymentStatus.Pending,
                    OrderDate = o.OrderDate
                })
                .ToListAsync();

            return Ok(orders);
        }


        // =====================================================
        // SEARCH ORDERS
        // =====================================================

        [HttpGet("orders/search")]
        public async Task<IActionResult> SearchOrders([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword)) return BadRequest("Please provide a search keyword.");

            keyword = keyword.Trim().ToLower();

            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.Restaurant)
                .Include(o => o.Rider)
                .Include(o => o.Payment)
                .Where(o =>
                    o.Id.ToString().Contains(keyword) ||
                    (o.Customer != null && o.Customer.FullName.ToLower().Contains(keyword)) ||
                    (o.Restaurant != null && o.Restaurant.Name.ToLower().Contains(keyword)))
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderListDto
                {
                    Id = o.Id,
                    CustomerName = o.Customer != null ? o.Customer.FullName : string.Empty,
                    RestaurantName = o.Restaurant != null ? o.Restaurant.Name : string.Empty,
                    RiderName = o.Rider != null ? o.Rider.FullName : "Not Assigned",
                    TotalAmount = o.TotalAmount,
                    OrderStatus = o.OrderStatus,
                    PaymentStatus = o.Payment != null ? o.Payment.PaymentStatus : PaymentStatus.Pending,
                    OrderDate = o.OrderDate
                })
                .ToListAsync();

            return Ok(orders);
        }


        // =====================================================
        // GET ALL PAYMENTS
        // =====================================================

        [HttpGet("payments")]
        public async Task<IActionResult> GetAllPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Order).ThenInclude(o => o.Customer)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentListDto
                {
                    Id = p.Id,
                    OrderId = p.OrderId,
                    CustomerName = p.Order != null && p.Order.Customer != null ? p.Order.Customer.FullName : string.Empty,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    PaymentStatus = p.PaymentStatus,
                    PaymentDate = p.PaymentDate
                })
                .ToListAsync();

            return Ok(payments);
        }


        // =====================================================
        // GET PAYMENT DETAILS
        // =====================================================

        [HttpGet("payments/{id}")]
        public async Task<IActionResult> GetPaymentDetails(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.Order).ThenInclude(o => o.Customer)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null) return NotFound("Payment not found.");

            var paymentDetails = new PaymentDetailsDto
            {
                Id = payment.Id,
                OrderId = payment.OrderId,
                CustomerName = payment.Order?.Customer?.FullName ?? string.Empty,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod,
                PaymentStatus = payment.PaymentStatus,
                PaymentDate = payment.PaymentDate
            };

            return Ok(paymentDetails);
        }


        // =====================================================
        // FILTER PAYMENTS BY STATUS
        // =====================================================

        [HttpGet("payments/status/{status}")]
        public async Task<IActionResult> GetPaymentsByStatus(PaymentStatus status)
        {
            var payments = await _context.Payments
                .Include(p => p.Order).ThenInclude(o => o.Customer)
                .Where(p => p.PaymentStatus == status)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentListDto
                {
                    Id = p.Id,
                    OrderId = p.OrderId,
                    CustomerName = p.Order != null && p.Order.Customer != null ? p.Order.Customer.FullName : string.Empty,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    PaymentStatus = p.PaymentStatus,
                    PaymentDate = p.PaymentDate
                })
                .ToListAsync();

            return Ok(payments);
        }


        // =====================================================
        // SEARCH PAYMENTS
        // =====================================================

        [HttpGet("payments/search")]
        public async Task<IActionResult> SearchPayments([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword)) return BadRequest("Please provide a search keyword.");

            keyword = keyword.Trim().ToLower();

            var payments = await _context.Payments
                .Include(p => p.Order).ThenInclude(o => o.Customer)
                .Where(p =>
                    p.Id.ToString().Contains(keyword) ||
                    p.OrderId.ToString().Contains(keyword) ||
                    (p.Order != null && p.Order.Customer != null && p.Order.Customer.FullName.ToLower().Contains(keyword)))
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentListDto
                {
                    Id = p.Id,
                    OrderId = p.OrderId,
                    CustomerName = p.Order != null && p.Order.Customer != null ? p.Order.Customer.FullName : string.Empty,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    PaymentStatus = p.PaymentStatus,
                    PaymentDate = p.PaymentDate
                })
                .ToListAsync();

            return Ok(payments);
        }


        // =====================================================
        // REVENUE SUMMARY
        // =====================================================

        [HttpGet("payments/revenue-summary")]
        public async Task<IActionResult> GetRevenueSummary()
        {
            var summary = new RevenueSummaryDto
            {
                TotalRevenue = await _context.Payments.Where(p => p.PaymentStatus == PaymentStatus.Paid).SumAsync(p => (decimal?)p.Amount) ?? 0,
                TotalPayments = await _context.Payments.CountAsync(),
                SuccessfulPayments = await _context.Payments.CountAsync(p => p.PaymentStatus == PaymentStatus.Paid),
                PendingPayments = await _context.Payments.CountAsync(p => p.PaymentStatus == PaymentStatus.Pending),
                FailedPayments = await _context.Payments.CountAsync(p => p.PaymentStatus == PaymentStatus.Failed)
            };

            return Ok(summary);
        }


        // =====================================================
        // GET PENDING VERIFICATIONS (ADMIN)
        // =====================================================
        
        [HttpGet("pending-verifications")]
        public async Task<IActionResult> GetPendingVerifications()
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            var pendingList = new List<object>();

            var suspendedRestaurants = await _context.Restaurants
                .Include(r => r.Owner)
                .Where(r => r.IsSuspended)
                .ToListAsync();

            foreach (var restaurant in suspendedRestaurants)
            {
                var markerPath = Path.Combine(uploadsFolder, $"rest_{restaurant.Id}_docs.json");

                if (System.IO.File.Exists(markerPath))
                {
                    var json = await System.IO.File.ReadAllTextAsync(markerPath);
                    using var doc = JsonDocument.Parse(json);

                    var nidFile = doc.RootElement.GetProperty("nid").GetString();
                    var licenseFile = doc.RootElement.GetProperty("license").GetString();

                    pendingList.Add(new
                    {
                        RestaurantId = restaurant.Id,
                        RestaurantName = restaurant.Name,
                        OwnerName = restaurant.Owner?.FullName ?? "Unknown",
                        OwnerEmail = restaurant.Owner?.Email ?? "Unknown",
                        Address = restaurant.Address,
                        Phone = restaurant.Phone,
                        SuspensionReason = restaurant.SuspensionReason,
                        SuspendedAt = restaurant.SuspendedAt,
                        NidUrl = $"/uploads/{nidFile}",
                        LicenseUrl = $"/uploads/{licenseFile}"
                    });
                }
            }

            return Ok(pendingList);
        }
    }
}