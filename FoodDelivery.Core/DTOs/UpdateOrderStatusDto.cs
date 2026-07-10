using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class UpdateOrderStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}