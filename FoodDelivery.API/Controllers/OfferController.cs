using System;
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
    public class OfferController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public OfferController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // =====================================
        // CREATE RESTAURANT OFFER
        // =====================================

        [HttpPost("create")]
        [Authorize(Roles = Roles.RestaurantOwner)]
        public async Task<IActionResult> CreateOffer(CreateOfferDto dto)
        {
            var userId = _userManager.GetUserId(User);

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.OwnerId == userId);

            if (restaurant == null)
            {
                return BadRequest("Restaurant not found.");
            }

            if (dto.EndDate <= dto.StartDate)
            {
                return BadRequest("Invalid offer duration.");
            }

            var offer = new Offer
            {
                Title = dto.Title,
                Description = dto.Description,
                CouponCode = dto.CouponCode.ToUpper(),
                DiscountPercentage = dto.DiscountPercentage,
                MaximumDiscount = dto.MaximumDiscount,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                RestaurantId = restaurant.Id,
                IsActive = true
            };

            _context.Offers.Add(offer);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Offer created successfully.",
                OfferId = offer.Id
            });
        }

        // =====================================
        // GET ACTIVE OFFERS - CUSTOMER
        // =====================================

        [HttpGet("active")]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> GetActiveOffers()
        {
            var today = DateTime.UtcNow;

            var offers = await _context.Offers
                .Include(o => o.Restaurant)
                .Where(o =>
                    o.IsActive &&
                    o.StartDate <= today &&
                    o.EndDate >= today)
                .Select(o => new OfferDto
                {
                    Id = o.Id,
                    Title = o.Title,
                    Description = o.Description,
                    CouponCode = o.CouponCode,
                    DiscountPercentage = o.DiscountPercentage,
                    MaximumDiscount = o.MaximumDiscount,
                    StartDate = o.StartDate,
                    EndDate = o.EndDate,
                    IsActive = o.IsActive,
                    RestaurantId = o.RestaurantId,
                    RestaurantName = o.Restaurant != null
                        ? o.Restaurant.Name
                        : "Platform Offer"
                })
                .ToListAsync();

            return Ok(offers);
        }

        // =====================================
        // VALIDATE COUPON CODE (CUSTOMER)
        // =====================================
        [HttpPost("validate")]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> ValidateCoupon(
            [FromBody] ValidateCouponDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CouponCode) || dto.RestaurantId <= 0)
            {
                return BadRequest("Invalid coupon request.");
            }

            var today = DateTime.UtcNow;

            var offer = await _context.Offers
                .FirstOrDefaultAsync(o =>
                    o.CouponCode == dto.CouponCode.ToUpper() &&
                    o.IsActive &&
                    o.StartDate <= today &&
                    o.EndDate >= today &&
                    (o.RestaurantId == null || o.RestaurantId == dto.RestaurantId) // Platform or specific restaurant
                );

            if (offer == null)
            {
                return NotFound("Invalid or expired coupon code.");
            }

            // Calculate the discount based on the cart total
            decimal discountAmount = dto.CartTotal * (offer.DiscountPercentage / 100);

            // Apply maximum discount limit if it exists
            if (offer.MaximumDiscount.HasValue && offer.MaximumDiscount.Value > 0)
            {
                if (discountAmount > offer.MaximumDiscount.Value)
                {
                    discountAmount = offer.MaximumDiscount.Value;
                }
            }

            decimal finalTotal = dto.CartTotal - discountAmount;
            if (finalTotal < 0) finalTotal = 0;

            return Ok(new
            {
                message = "Coupon applied successfully!",
                couponCode = offer.CouponCode,
                discountPercentage = offer.DiscountPercentage,
                discountAmount = Math.Round(discountAmount, 2),
                finalTotal = Math.Round(finalTotal, 2)
            });
        }

        // =====================================
        // UPDATE RESTAURANT OWNER OFFER
        // =====================================

        [HttpPut("update/{id}")]
        [Authorize(Roles = Roles.RestaurantOwner)]
        public async Task<IActionResult> UpdateOffer(
            int id,
            UpdateOfferDto dto)
        {
            var userId = _userManager.GetUserId(User);

            var offer = await _context.Offers
                .Include(o => o.Restaurant)
                .FirstOrDefaultAsync(o =>
                    o.Id == id &&
                    o.Restaurant != null &&
                    o.Restaurant.OwnerId == userId);

            if (offer == null)
            {
                return NotFound("Offer not found.");
            }

            if (dto.EndDate <= dto.StartDate)
            {
                return BadRequest("Invalid offer duration.");
            }

            offer.Title = dto.Title;
            offer.Description = dto.Description;
            offer.CouponCode = dto.CouponCode.ToUpper();
            offer.DiscountPercentage = dto.DiscountPercentage;
            offer.MaximumDiscount = dto.MaximumDiscount;
            offer.StartDate = dto.StartDate;
            offer.EndDate = dto.EndDate;
            offer.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Offer updated successfully."
            });
        }

        // =====================================
        // DELETE RESTAURANT OWNER OFFER
        // =====================================

        [HttpDelete("delete/{id}")]
        [Authorize(Roles = Roles.RestaurantOwner)]
        public async Task<IActionResult> DeleteOffer(int id)
        {
            var userId = _userManager.GetUserId(User);

            var offer = await _context.Offers
                .Include(o => o.Restaurant)
                .FirstOrDefaultAsync(o =>
                    o.Id == id &&
                    o.Restaurant != null &&
                    o.Restaurant.OwnerId == userId);

            if (offer == null)
            {
                return NotFound("Offer not found.");
            }

            _context.Offers.Remove(offer);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Offer deleted successfully."
            });
        }

        // =====================================
        // ADMIN GET ALL OFFERS
        // =====================================

        [HttpGet("all")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetAllOffers()
        {
            var offers = await _context.Offers
                .Include(o => o.Restaurant)
                .OrderByDescending(o => o.StartDate)
                .Select(o => new OfferDto
                {
                    Id = o.Id,
                    Title = o.Title,
                    Description = o.Description,
                    CouponCode = o.CouponCode,
                    DiscountPercentage = o.DiscountPercentage,
                    MaximumDiscount = o.MaximumDiscount,
                    StartDate = o.StartDate,
                    EndDate = o.EndDate,
                    IsActive = o.IsActive,
                    RestaurantId = o.RestaurantId,
                    RestaurantName = o.Restaurant != null
                        ? o.Restaurant.Name
                        : "Platform Offer"
                })
                .ToListAsync();

            return Ok(offers);
        }

        // =====================================
        // ADMIN CREATE PLATFORM OFFER
        // =====================================

        [HttpPost("admin/create")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> AdminCreateOffer(CreateOfferDto dto)
        {
            if (dto.EndDate <= dto.StartDate)
            {
                return BadRequest("Invalid offer duration.");
            }

            var offer = new Offer
            {
                Title = dto.Title,
                Description = dto.Description,
                CouponCode = dto.CouponCode.ToUpper(),
                DiscountPercentage = dto.DiscountPercentage,
                MaximumDiscount = dto.MaximumDiscount,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,

                // NULL means this is a system-wide platform offer.
                RestaurantId = null,

                IsActive = true
            };

            _context.Offers.Add(offer);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Platform offer created successfully.",
                OfferId = offer.Id
            });
        }

        // =====================================
        // ADMIN DELETE OFFER
        // =====================================

        [HttpDelete("admin/delete/{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> AdminDeleteOffer(int id)
        {
            var offer = await _context.Offers
                .FirstOrDefaultAsync(o => o.Id == id);

            if (offer == null)
            {
                return NotFound("Offer not found.");
            }

            _context.Offers.Remove(offer);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Offer removed by admin."
            });
        }
    }
}