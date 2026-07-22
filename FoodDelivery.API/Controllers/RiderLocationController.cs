using System.Security.Claims;
using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RiderLocationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RiderLocationController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // UPDATE RIDER LOCATION
        // =====================================================

        [Authorize(Roles = "DeliveryRider")]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateLocation(UpdateRiderLocationDto model)
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