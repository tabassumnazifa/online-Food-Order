using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class UpdateOrderDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}