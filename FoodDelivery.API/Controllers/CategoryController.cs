using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================
        // CREATE CATEGORY
        // =========================
        [HttpPost]
        public async Task<IActionResult> CreateCategory(CreateCategoryDto model)
        {
            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == model.Name);

            if (existingCategory != null)
            {
                return BadRequest("Category already exists.");
            }

            var category = new Category
            {
                Name = model.Name
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok("Category created successfully.");
        }

        // =========================
        // GET ALL CATEGORIES
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _context.Categories
                .Select(c => new CategoryResponseDto
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToListAsync();

            return Ok(categories);
        }

        // =========================
        // GET CATEGORY BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await _context.Categories
                .Where(c => c.Id == id)
                .Select(c => new CategoryResponseDto
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .FirstOrDefaultAsync();

            if (category == null)
            {
                return NotFound("Category not found.");
            }

            return Ok(category);
        }

        // =========================
        // UPDATE CATEGORY
        // =========================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, UpdateCategoryDto model)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound("Category not found.");
            }

            category.Name = model.Name;

            await _context.SaveChangesAsync();

            return Ok("Category updated successfully.");
        }

        // =========================
        // DELETE CATEGORY
        // =========================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound("Category not found.");
            }

            _context.Categories.Remove(category);

            await _context.SaveChangesAsync();

            return Ok("Category deleted successfully.");
        }
    }
}