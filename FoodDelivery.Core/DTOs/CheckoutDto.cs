using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class CheckoutDto
    {
        [Required]
        public int RestaurantId { get; set; }

        [Required]
        [StringLength(500, ErrorMessage = "Delivery address is too long.")]
        public string DeliveryAddress { get; set; } = string.Empty;
    }
}