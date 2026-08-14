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
        // ADD ITEM TO CART
        // =========================
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart(CreateCartItemDto model)
        {
            // Get the logged-in customer's ID from the JWT token
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            // Check whether the selected food item exists
            var food = await _context.Foods.FindAsync(model.FoodId);

            if (food == null)
            {
                return NotFound("Food item not found.");
            }

            // Check whether this food item already exists in the customer's cart
            var existingCartItem = await _context.CartItems
                .FirstOrDefaultAsync(c =>
                    c.CustomerId == customerId &&
                    c.FoodId == model.FoodId);

            if (existingCartItem != null)
            {
                // Increase the quantity if the item already exists
                existingCartItem.Quantity += model.Quantity;
            }
            else
            {
                // Otherwise create a new cart item
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

        
  [HttpGet]
public async Task<IActionResult> GetMyCart()
{
    var customerId =
        User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(customerId))
    {
        return Unauthorized();
    }

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

            // IMPORTANT
            RestaurantId = c.Food.RestaurantId
        })
        .ToListAsync();

    return Ok(cartItems);
}

        // =========================
        // UPDATE CART ITEM QUANTITY
        // =========================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, UpdateCartItemDto model)
        {
            // Get the logged-in customer's ID
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            // Find the cart item that belongs to the logged-in customer
            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(c =>
                    c.Id == id &&
                    c.CustomerId == customerId);

            if (cartItem == null)
            {
                return NotFound("Cart item not found.");
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
            // Get the logged-in customer's ID
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            // Find the cart item that belongs to the logged-in customer
            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(c =>
                    c.Id == id &&
                    c.CustomerId == customerId);

            if (cartItem == null)
            {
                return NotFound("Cart item not found.");
            }

            _context.CartItems.Remove(cartItem);

            await _context.SaveChangesAsync();

            return Ok("Cart item removed successfully.");
        }
    }
}