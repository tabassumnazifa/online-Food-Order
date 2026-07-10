using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        // =========================
        // ADD A NEW FOOD ITEM
        // =========================
        [HttpPost("add")]
        public async Task<IActionResult> AddFood(CreateFoodDto model)
        {
            // Check if the restaurant exists
            var restaurant = await _context.Restaurants.FindAsync(model.RestaurantId);

            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }

            // Check if the category exists
            var category = await _context.Categories.FindAsync(model.CategoryId);

            if (category == null)
            {
                return NotFound("Category not found.");
            }

            // Create a new food item
            var food = new Food
            {
                Name = model.Name,
                Description = model.Description,
                Price = model.Price,
                IsAvailable = model.IsAvailable,
                RestaurantId = model.RestaurantId,
                CategoryId = model.CategoryId
            };

            _context.Foods.Add(food);
            await _context.SaveChangesAsync();

            return Ok("Food added successfully.");
        }

        // =========================
        // GET ALL FOOD ITEMS
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAllFoods()
        {
            var foods = await _context.Foods
                .Include(f => f.Restaurant)
                .Include(f => f.Category)
                .Select(f => new FoodResponseDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Description = f.Description,
                    Price = f.Price,
                    IsAvailable = f.IsAvailable,
                    RestaurantId = f.RestaurantId,
                    RestaurantName = f.Restaurant!.Name,
                    CategoryId = f.CategoryId,
                    CategoryName = f.Category!.Name
                })
                .ToListAsync();

            return Ok(foods);
        }

        // =========================
        // GET FOOD BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFoodById(int id)
        {
            var food = await _context.Foods
                .Include(f => f.Restaurant)
                .Include(f => f.Category)
                .Where(f => f.Id == id)
                .Select(f => new FoodResponseDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Description = f.Description,
                    Price = f.Price,
                    IsAvailable = f.IsAvailable,
                    RestaurantId = f.RestaurantId,
                    RestaurantName = f.Restaurant!.Name,
                    CategoryId = f.CategoryId,
                    CategoryName = f.Category!.Name
                })
                .FirstOrDefaultAsync();

            if (food == null)
            {
                return NotFound("Food not found.");
            }

            return Ok(food);
        }

        // =========================
        // UPDATE FOOD
        // =========================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFood(int id, UpdateFoodDto model)
        {
            var food = await _context.Foods.FindAsync(id);

            if (food == null)
            {
                return NotFound("Food not found.");
            }

            // Check if the category exists
            var category = await _context.Categories.FindAsync(model.CategoryId);

            if (category == null)
            {
                return NotFound("Category not found.");
            }

            // Update food details
            food.Name = model.Name;
            food.Description = model.Description;
            food.Price = model.Price;
            food.IsAvailable = model.IsAvailable;
            food.CategoryId = model.CategoryId;

            await _context.SaveChangesAsync();

            return Ok("Food updated successfully.");
        }

        // =========================
        // DELETE FOOD
        // =========================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFood(int id)
        {
            var food = await _context.Foods.FindAsync(id);

            if (food == null)
            {
                return NotFound("Food not found.");
            }

            _context.Foods.Remove(food);
            await _context.SaveChangesAsync();

            return Ok("Food deleted successfully.");
        }
    }
}