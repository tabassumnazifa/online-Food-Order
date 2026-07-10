using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class CreateOrderDto
    {
        [Required]
        public int RestaurantId { get; set; }

        [Required]
        public decimal TotalAmount { get; set; }
    }
}