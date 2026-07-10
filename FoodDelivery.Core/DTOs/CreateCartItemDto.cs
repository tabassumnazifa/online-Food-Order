using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class CreateCartItemDto
    {
        [Required]
        public int FoodId { get; set; }

        [Required]
        [Range(1, 100)]
        public int Quantity { get; set; }
    }
}