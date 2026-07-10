using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class CheckoutDto
    {
        [Required]
        public int RestaurantId { get; set; }
    }
}