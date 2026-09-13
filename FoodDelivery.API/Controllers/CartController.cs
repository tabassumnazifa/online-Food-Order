using FoodDelivery.Core.Constants; // IMPORTANT: Add this for the limits
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
    [Authorize(Roles = Roles.Customer)]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================
        // ADD ITEM TO CART (WITH LIMITS)
        // =========================
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart(CreateCartItemDto model)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var food = await _context.Foods.FindAsync(model.FoodId);

            if (food == null)
                return NotFound("Food item not found.");

            // Get existing cart item if it exists
            var existingCartItem = await _context.CartItems
                .FirstOrDefaultAsync(c =>
                    c.CustomerId == customerId &&
                    c.FoodId == model.FoodId);

            int newQuantity = existingCartItem != null 
                ? existingCartItem.Quantity + model.Quantity 
                : model.Quantity;

            // 🛡️ LIMIT 1: Max quantity per item (e.g., max 10)
            if (newQuantity > OrderLimits.MaxQuantityPerItem)
            {
                return BadRequest($"You cannot order more than {OrderLimits.MaxQuantityPerItem} of the same item.");
            }

            // Get all items currently in the cart to calculate totals
            var allCartItems = await _context.CartItems
                .Where(c => c.CustomerId == customerId)
                .Include(c => c.Food)
                .ToListAsync();

            // Calculate current totals (excluding the item being added/updated)
            int currentTotalItems = allCartItems.Where(c => c.FoodId != model.FoodId).Sum(c => c.Quantity);
            decimal currentTotalValue = allCartItems.Where(c => c.FoodId != model.FoodId).Sum(c => c.Food!.Price * c.Quantity);

            // Add the new/updated item to the totals
            int finalTotalItems = currentTotalItems + newQuantity;
            decimal finalTotalValue = currentTotalValue + (food.Price * newQuantity);

            // 🛡️ LIMIT 2: Max total items per order
            if (finalTotalItems > OrderLimits.MaxItemsPerOrder)
            {
                return BadRequest($"Your cart cannot exceed {OrderLimits.MaxItemsPerOrder} total items.");
            }

            // 🛡️ LIMIT 3: Max order value
            if (finalTotalValue > OrderLimits.MaxOrderValue)
            {
                return BadRequest($"Order value cannot exceed ৳{OrderLimits.MaxOrderValue:N0}.");
            }

            // If all checks pass, add/update the cart item
            if (existingCartItem != null)
            {
                existingCartItem.Quantity = newQuantity;
            }
            else
            {
                var cartItem = new CartItem
                {
                    CustomerId = customerId,
                    FoodId = model.FoodId,
                    Quantity = model.Quantity
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();

            return Ok("Item added to cart successfully.");
        }

        // =========================
        // GET MY CART
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetMyCart()
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var cartItems = await _context.CartItems
                .Where(c => c.CustomerId == customerId)
                .Include(c => c.Food)
                .Select(c => new CartItemResponseDto
                {
                    Id = c.Id,
                    FoodId = c.FoodId,
                    FoodName = c.Food!.Name,
                    Price = c.Food.Price,
                    Quantity = c.Quantity,
                    TotalPrice = c.Food.Price * c.Quantity,
                    RestaurantId = c.Food.RestaurantId
                })
                .ToListAsync();

            return Ok(cartItems);
        }

        // =========================
        // UPDATE CART ITEM QUANTITY (WITH LIMITS)
        // =========================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, UpdateCartItemDto model)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var cartItem = await _context.CartItems
                .Include(c => c.Food)
                .FirstOrDefaultAsync(c => c.Id == id && c.CustomerId == customerId);

            if (cartItem == null)
                return NotFound("Cart item not found.");

            // 🛡️ LIMIT 1: Max quantity per item
            if (model.Quantity > OrderLimits.MaxQuantityPerItem)
            {
                return BadRequest($"You cannot order more than {OrderLimits.MaxQuantityPerItem} of the same item.");
            }

            // Get all other items in the cart to calculate totals
            var allCartItems = await _context.CartItems
                .Where(c => c.CustomerId == customerId && c.Id != id) // Exclude the item being updated
                .Include(c => c.Food)
                .ToListAsync();

            int finalTotalItems = allCartItems.Sum(c => c.Quantity) + model.Quantity;
            decimal finalTotalValue = allCartItems.Sum(c => c.Food!.Price * c.Quantity) + (cartItem.Food!.Price * model.Quantity);

            // 🛡️ LIMIT 2: Max total items
            if (finalTotalItems > OrderLimits.MaxItemsPerOrder)
            {
                return BadRequest($"Your cart cannot exceed {OrderLimits.MaxItemsPerOrder} total items.");
            }

            // 🛡️ LIMIT 3: Max order value
            if (finalTotalValue > OrderLimits.MaxOrderValue)
            {
                return BadRequest($"Order value cannot exceed ৳{OrderLimits.MaxOrderValue:N0}.");
            }

            cartItem.Quantity = model.Quantity;
            await _context.SaveChangesAsync();

            return Ok("Cart item updated successfully.");
        }

        // =========================
        // REMOVE ITEM FROM CART
        // =========================
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveCartItem(int id)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.Id == id && c.CustomerId == customerId);

            if (cartItem == null)
                return NotFound("Cart item not found.");

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return Ok("Cart item removed successfully.");
        }
    }
}