using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class CreateFoodDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public decimal Price { get; set; }

        public bool IsAvailable { get; set; } = true;

        [Required]
        public int RestaurantId { get; set; }

        [Required]
        public int CategoryId { get; set; }
    }
}