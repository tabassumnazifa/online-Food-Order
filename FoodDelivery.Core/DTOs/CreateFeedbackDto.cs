using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class CreateFeedbackDto
    {
        [Required]
        public int RestaurantId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(500)]
        public string Comment { get; set; } = string.Empty;
    }
}