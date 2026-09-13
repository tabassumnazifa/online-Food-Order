using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class CheckoutDto
    {
        [Required]
        public int RestaurantId { get; set; }

        // ADDED: So the backend accepts the address from the frontend
        [Required]
        public string DeliveryAddress { get; set; } = string.Empty;

        // ADDED: So the backend accepts the coupon code from the frontend
        public string? CouponCode { get; set; }
    }
}