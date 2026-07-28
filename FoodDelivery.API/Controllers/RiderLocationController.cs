using System.Security.Claims;
using FoodDelivery.API.Hubs;
using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Enums;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RiderLocationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<RiderLocationHub> _hubContext;

        public RiderLocationController(
            ApplicationDbContext context,
            IHubContext<RiderLocationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // =====================================================
        // UPDATE RIDER LOCATION
        // =====================================================

        [Authorize(Roles = "DeliveryRider")]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateLocation(
            UpdateRiderLocationDto model)
        {
            var riderId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(riderId))
            {
                return Unauthorized();
            }

            var location = await _context.RiderLocations
                .FirstOrDefaultAsync(x => x.RiderId == riderId);

            if (location == null)
            {
                location = new RiderLocation
                {
                    RiderId = riderId,
                    Latitude = model.Latitude,
                    Longitude = model.Longitude,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.RiderLocations.Add(location);
            }
            else
            {
                location.Latitude = model.Latitude;
                location.Longitude = model.Longitude;
                location.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // =====================================================
            // SEND LIVE LOCATION TO ACTIVE ORDER TRACKING GROUPS
            // =====================================================

            var activeOrders = await _context.Orders
                .Where(o =>
                    o.RiderId == riderId &&
                    o.OrderStatus != OrderStatus.Delivered &&
                    o.OrderStatus != OrderStatus.Cancelled)
                .Select(o => o.Id)
                .ToListAsync();

            foreach (var orderId in activeOrders)
            {
                await _hubContext.Clients
                    .Group($"order-{orderId}")
                    .SendAsync(
                        "ReceiveLocation",
                        new
                        {
                            OrderId = orderId,
                            RiderId = riderId,
                            Latitude = location.Latitude,
                            Longitude = location.Longitude,
                            UpdatedAt = location.UpdatedAt
                        });
            }

            return Ok(new
            {
                message = "Location updated successfully."
            });
        }

        // =====================================================
        // GET RIDER LOCATION
        // =====================================================

        [HttpGet("{riderId}")]
        public async Task<IActionResult> GetLocation(string riderId)
        {
            var location = await _context.RiderLocations
                .Where(x => x.RiderId == riderId)
                .Select(x => new RiderLocationDto
                {
                    RiderId = x.RiderId,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                    UpdatedAt = x.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (location == null)
            {
                return NotFound("Location not found.");
            }

            return Ok(location);
        }
    }
}