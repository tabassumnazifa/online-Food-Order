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
        // =========================
// GET RESTAURANT DETAILS
// =========================
[HttpGet("restaurants/{id}")]
public async Task<IActionResult> GetRestaurantDetails(int id)
{
    var restaurant = await _context.Restaurants
        .Include(r => r.Owner)
        .Include(r => r.Foods)
        .Include(r => r.Feedbacks)
        .FirstOrDefaultAsync(r => r.Id == id);

    if (restaurant == null)
    {
        return NotFound("Restaurant not found.");
    }

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
// =========================
// DELETE RESTAURANT
// =========================
[HttpDelete("restaurants/{id}")]
public async Task<IActionResult> DeleteRestaurant(int id)
{
    var restaurant = await _context.Restaurants
        .Include(r => r.Foods)
        .Include(r => r.Feedbacks)
        .FirstOrDefaultAsync(r => r.Id == id);

    if (restaurant == null)
    {
        return NotFound("Restaurant not found.");
    }

    _context.Restaurants.Remove(restaurant);
    await _context.SaveChangesAsync();

    return Ok(new
    {
        Message = "Restaurant deleted successfully."
    });
}
// =========================
// DELETE CUSTOMER
// =========================
[HttpDelete("customers/{id}")]
public async Task<IActionResult> DeleteCustomer(string id)
{
    var customer = await _userManager.FindByIdAsync(id);

    if (customer == null)
    {
        return NotFound("Customer not found.");
    }

    var isCustomer = await _userManager.IsInRoleAsync(customer, Roles.Customer);

    if (!isCustomer)
    {
        return BadRequest("The specified user is not a customer.");
    }

    var result = await _userManager.DeleteAsync(customer);

    if (!result.Succeeded)
    {
        return BadRequest(result.Errors);
    }

    return Ok(new
    {
        Message = "Customer deleted successfully."
    });
}
// =========================
// DELETE RESTAURANT OWNER
// =========================
[HttpDelete("restaurant-owners/{id}")]
public async Task<IActionResult> DeleteRestaurantOwner(string id)
{
    var owner = await _userManager.FindByIdAsync(id);

    if (owner == null)
    {
        return NotFound("Restaurant owner not found.");
    }

    var isRestaurantOwner = await _userManager.IsInRoleAsync(owner, Roles.RestaurantOwner);

    if (!isRestaurantOwner)
    {
        return BadRequest("The specified user is not a restaurant owner.");
    }

    var result = await _userManager.DeleteAsync(owner);

    if (!result.Succeeded)
    {
        return BadRequest(result.Errors);
    }

    return Ok(new
    {
        Message = "Restaurant owner deleted successfully."
    });
}
// =========================
// DELETE DELIVERY RIDER
// =========================
[HttpDelete("delivery-riders/{id}")]
public async Task<IActionResult> DeleteDeliveryRider(string id)
{
    var rider = await _userManager.FindByIdAsync(id);

    if (rider == null)
    {
        return NotFound("Delivery rider not found.");
    }

    var isDeliveryRider = await _userManager.IsInRoleAsync(rider, Roles.DeliveryRider);

    if (!isDeliveryRider)
    {
        return BadRequest("The specified user is not a delivery rider.");
    }

    var result = await _userManager.DeleteAsync(rider);

    if (!result.Succeeded)
    {
        return BadRequest(result.Errors);
    }

    return Ok(new
    {
        Message = "Delivery rider deleted successfully."
    });
}
// =========================
// GET ALL ORDERS
// =========================
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
            CustomerName = o.Customer != null
                ? o.Customer.FullName
                : string.Empty,

            RestaurantName = o.Restaurant != null
                ? o.Restaurant.Name
                : string.Empty,

            RiderName = o.Rider != null
                ? o.Rider.FullName
                : "Not Assigned",

            TotalAmount = o.TotalAmount,

            OrderStatus = o.OrderStatus,

            PaymentStatus = o.Payment != null
                ? o.Payment.PaymentStatus
                : PaymentStatus.Pending,

            OrderDate = o.OrderDate
        })
        .ToListAsync();

    return Ok(orders);
}
// =========================
// GET ORDER DETAILS
// =========================
[HttpGet("orders/{id}")]
public async Task<IActionResult> GetOrderDetails(int id)
{
    var order = await _context.Orders
        .Include(o => o.Customer)
        .Include(o => o.Restaurant)
        .Include(o => o.Rider)
        .Include(o => o.Payment)
        .FirstOrDefaultAsync(o => o.Id == id);

    if (order == null)
    {
        return NotFound("Order not found.");
    }

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
// =========================
// GET ORDERS BY STATUS
// =========================
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
            CustomerName = o.Customer != null
                ? o.Customer.FullName
                : string.Empty,

            RestaurantName = o.Restaurant != null
                ? o.Restaurant.Name
                : string.Empty,

            RiderName = o.Rider != null
                ? o.Rider.FullName
                : "Not Assigned",

            TotalAmount = o.TotalAmount,

            OrderStatus = o.OrderStatus,

            PaymentStatus = o.Payment != null
                ? o.Payment.PaymentStatus
                : PaymentStatus.Pending,

            OrderDate = o.OrderDate
        })
        .ToListAsync();

    return Ok(orders);
}
// =========================
// SEARCH ORDERS
// =========================
[HttpGet("orders/search")]
public async Task<IActionResult> SearchOrders([FromQuery] string keyword)
{
    if (string.IsNullOrWhiteSpace(keyword))
    {
        return BadRequest("Please provide a search keyword.");
    }

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
            CustomerName = o.Customer != null
                ? o.Customer.FullName
                : string.Empty,

            RestaurantName = o.Restaurant != null
                ? o.Restaurant.Name
                : string.Empty,

            RiderName = o.Rider != null
                ? o.Rider.FullName
                : "Not Assigned",

            TotalAmount = o.TotalAmount,

            OrderStatus = o.OrderStatus,

            PaymentStatus = o.Payment != null
                ? o.Payment.PaymentStatus
                : PaymentStatus.Pending,

            OrderDate = o.OrderDate
        })
        .ToListAsync();

    return Ok(orders);
}
// =========================
// GET ALL PAYMENTS
// =========================
[HttpGet("payments")]
public async Task<IActionResult> GetAllPayments()
{
    var payments = await _context.Payments
        .Include(p => p.Order)
            .ThenInclude(o => o.Customer)
        .OrderByDescending(p => p.PaymentDate)
        .Select(p => new PaymentListDto
        {
            Id = p.Id,
            OrderId = p.OrderId,
            CustomerName = p.Order != null && p.Order.Customer != null
                ? p.Order.Customer.FullName
                : string.Empty,
            Amount = p.Amount,
            PaymentMethod = p.PaymentMethod,
            PaymentStatus = p.PaymentStatus,
            PaymentDate = p.PaymentDate
        })
        .ToListAsync();

    return Ok(payments);
}
// =========================
// GET PAYMENT DETAILS
// =========================
[HttpGet("payments/{id}")]
public async Task<IActionResult> GetPaymentDetails(int id)
{
    var payment = await _context.Payments
        .Include(p => p.Order)
            .ThenInclude(o => o.Customer)
        .FirstOrDefaultAsync(p => p.Id == id);

    if (payment == null)
    {
        return NotFound("Payment not found.");
    }

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
// =========================
// FILTER PAYMENTS BY STATUS
// =========================
[HttpGet("payments/status/{status}")]
public async Task<IActionResult> GetPaymentsByStatus(PaymentStatus status)
{
    var payments = await _context.Payments
        .Include(p => p.Order)
            .ThenInclude(o => o.Customer)
        .Where(p => p.PaymentStatus == status)
        .OrderByDescending(p => p.PaymentDate)
        .Select(p => new PaymentListDto
        {
            Id = p.Id,
            OrderId = p.OrderId,
            CustomerName = p.Order != null && p.Order.Customer != null
                ? p.Order.Customer.FullName
                : string.Empty,
            Amount = p.Amount,
            PaymentMethod = p.PaymentMethod,
            PaymentStatus = p.PaymentStatus,
            PaymentDate = p.PaymentDate
        })
        .ToListAsync();

    return Ok(payments);
}
// =========================
// SEARCH PAYMENTS
// =========================
[HttpGet("payments/search")]
public async Task<IActionResult> SearchPayments([FromQuery] string keyword)
{
    if (string.IsNullOrWhiteSpace(keyword))
    {
        return BadRequest("Please provide a search keyword.");
    }

    keyword = keyword.Trim().ToLower();

    var payments = await _context.Payments
        .Include(p => p.Order)
            .ThenInclude(o => o.Customer)
        .Where(p =>
            p.Id.ToString().Contains(keyword) ||
            p.OrderId.ToString().Contains(keyword) ||
            (p.Order != null &&
             p.Order.Customer != null &&
             p.Order.Customer.FullName.ToLower().Contains(keyword)))
        .OrderByDescending(p => p.PaymentDate)
        .Select(p => new PaymentListDto
        {
            Id = p.Id,
            OrderId = p.OrderId,
            CustomerName = p.Order != null && p.Order.Customer != null
                ? p.Order.Customer.FullName
                : string.Empty,
            Amount = p.Amount,
            PaymentMethod = p.PaymentMethod,
            PaymentStatus = p.PaymentStatus,
            PaymentDate = p.PaymentDate
        })
        .ToListAsync();

    return Ok(payments);
}
// =========================
// REVENUE SUMMARY
// =========================
[HttpGet("payments/revenue-summary")]
public async Task<IActionResult> GetRevenueSummary()
{
    var summary = new RevenueSummaryDto
    {
        TotalRevenue = await _context.Payments
            .Where(p => p.PaymentStatus == PaymentStatus.Paid)
            .SumAsync(p => (decimal?)p.Amount) ?? 0,

        TotalPayments = await _context.Payments.CountAsync(),

        SuccessfulPayments = await _context.Payments
            .CountAsync(p => p.PaymentStatus == PaymentStatus.Paid),

        PendingPayments = await _context.Payments
            .CountAsync(p => p.PaymentStatus == PaymentStatus.Pending),

        FailedPayments = await _context.Payments
            .CountAsync(p => p.PaymentStatus == PaymentStatus.Failed)
    };

    return Ok(summary);
}
    }
}