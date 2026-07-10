using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class UpdateRestaurantDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;
    }
}