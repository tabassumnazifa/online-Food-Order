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
    public class FoodController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FoodController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // ADD FOOD
        // =====================================================

        [Authorize(Roles = Roles.RestaurantOwner)]
        [HttpPost("add")]
        public async Task<IActionResult> AddFood(CreateFoodDto model)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r =>
                    r.Id == model.RestaurantId &&
                    r.OwnerId == ownerId);

            if (restaurant == null)
            {
                return Forbid();
            }

            // Prevent duplicate food in the same restaurant
            var exists = await _context.Foods.AnyAsync(f =>
                f.RestaurantId == restaurant.Id &&
                f.Name == model.Name);

            if (exists)
            {
                return BadRequest(
                    "Food already exists in this restaurant.");
            }

            var food = new Food
            {
                Name = model.Name,
                Description = model.Description,
                Price = model.Price,
                IsAvailable = model.IsAvailable,
                RestaurantId = restaurant.Id
            };

            _context.Foods.Add(food);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Food added successfully."
            });
        }


        // =====================================================
        // GET ALL FOODS
        // PUBLIC
        // =====================================================

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllFoods()
        {
            var foods = await _context.Foods
                .Include(f => f.Restaurant)
                .Select(f => new FoodResponseDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Description = f.Description,
                    Price = f.Price,
                    IsAvailable = f.IsAvailable,

                    RestaurantId = f.RestaurantId,
                    RestaurantName = f.Restaurant!.Name
                })
                .ToListAsync();

            return Ok(foods);
        }


        // =====================================================
        // GET FOODS BY RESTAURANT
        // PUBLIC
        // =====================================================

        [AllowAnonymous]
        [HttpGet("restaurant/{restaurantId}")]
        public async Task<IActionResult> GetFoodsByRestaurant(
            int restaurantId)
        {
            var restaurantExists = await _context.Restaurants
                .AnyAsync(r => r.Id == restaurantId);

            if (!restaurantExists)
            {
                return NotFound("Restaurant not found.");
            }

            var foods = await _context.Foods
                .Where(f => f.RestaurantId == restaurantId)
                .Include(f => f.Restaurant)
                .Select(f => new FoodResponseDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Description = f.Description,
                    Price = f.Price,
                    IsAvailable = f.IsAvailable,

                    RestaurantId = f.RestaurantId,
                    RestaurantName = f.Restaurant!.Name
                })
                .OrderBy(f => f.Name)
                .ToListAsync();

            return Ok(foods);
        }


        // =====================================================
        // GET FOOD BY ID
        // PUBLIC
        // =====================================================

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFoodById(int id)
        {
            var food = await _context.Foods
                .Include(f => f.Restaurant)
                .Where(f => f.Id == id)
                .Select(f => new FoodResponseDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Description = f.Description,
                    Price = f.Price,
                    IsAvailable = f.IsAvailable,

                    RestaurantId = f.RestaurantId,
                    RestaurantName = f.Restaurant!.Name
                })
                .FirstOrDefaultAsync();

            if (food == null)
            {
                return NotFound("Food not found.");
            }

            return Ok(food);
        }


        // =====================================================
        // UPDATE FOOD
        // OWNER CAN UPDATE ONLY THEIR OWN FOOD
        // =====================================================

        [Authorize(Roles = Roles.RestaurantOwner)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFood(
            int id,
            UpdateFoodDto model)
        {
            var ownerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var food = await _context.Foods
                .Include(f => f.Restaurant)
                .FirstOrDefaultAsync(f =>
                    f.Id == id &&
                    f.Restaurant!.OwnerId == ownerId);

            if (food == null)
            {
                return NotFound(
                    "Food not found or you do not own this food.");
            }

            food.Name = model.Name;
            food.Description = model.Description;
            food.Price = model.Price;
            food.IsAvailable = model.IsAvailable;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Food updated successfully."
            });
        }


        // =====================================================
        // DELETE FOOD
        // OWNER CAN DELETE ONLY THEIR OWN FOOD
        // =====================================================

        [Authorize(Roles = Roles.RestaurantOwner)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFood(int id)
        {
            var ownerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized();

            var food = await _context.Foods
                .Include(f => f.Restaurant)
                .FirstOrDefaultAsync(f =>
                    f.Id == id &&
                    f.Restaurant!.OwnerId == ownerId);

            if (food == null)
            {
                return NotFound(
                    "Food not found or you do not own this food.");
            }

            _context.Foods.Remove(food);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Food deleted successfully."
            });
        }
    }
}