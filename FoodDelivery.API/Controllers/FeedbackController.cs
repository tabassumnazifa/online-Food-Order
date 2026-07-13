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
    public class FeedbackController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FeedbackController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================
        // SUBMIT FEEDBACK
        // =========================
        [HttpPost]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> CreateFeedback(CreateFeedbackDto model)
        {
            // Get logged-in customer
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            // Check restaurant exists
            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == model.RestaurantId);

            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }

            // Prevent duplicate feedback
            var alreadyReviewed = await _context.Feedbacks
                .AnyAsync(f =>
                    f.CustomerId == customerId &&
                    f.RestaurantId == model.RestaurantId);

            if (alreadyReviewed)
            {
                return BadRequest("You have already submitted feedback for this restaurant.");
            }

            // Create feedback
            var feedback = new Feedback
            {
                CustomerId = customerId,
                RestaurantId = model.RestaurantId,
                Rating = model.Rating,
                Comment = model.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Feedback submitted successfully.",
                FeedbackId = feedback.Id
            });
        }

        // =========================
        // MY FEEDBACK
        // =========================
        [HttpGet("my-feedback")]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> GetMyFeedback()
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            var feedbacks = await _context.Feedbacks
                .Where(f => f.CustomerId == customerId)
                .Include(f => f.Restaurant)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackResponseDto
                {
                    FeedbackId = f.Id,
                    CustomerName = string.Empty,
                    RestaurantName = f.Restaurant!.Name,
                    Rating = f.Rating,
                    Comment = f.Comment,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();

            return Ok(feedbacks);
        }

        // =========================
        // RESTAURANT FEEDBACK
        // =========================
        [HttpGet("restaurant-feedback")]
        [Authorize(Roles = Roles.RestaurantOwner)]
        public async Task<IActionResult> GetRestaurantFeedback()
        {
            // Get logged-in restaurant owner
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
            {
                return Unauthorized();
            }

            // Find owner's restaurant
            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.OwnerId == ownerId);

            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }

            // Get feedback
            var feedbacks = await _context.Feedbacks
                .Where(f => f.RestaurantId == restaurant.Id)
                .Include(f => f.Customer)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackResponseDto
                {
                    FeedbackId = f.Id,
                    CustomerName = f.Customer != null ? f.Customer.FullName : string.Empty,
                    RestaurantName = restaurant.Name,
                    Rating = f.Rating,
                    Comment = f.Comment,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();

            return Ok(feedbacks);
        }
    }
}