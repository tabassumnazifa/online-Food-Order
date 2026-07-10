using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDelivery.Core.Models
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [ForeignKey(nameof(CustomerId))]
        public ApplicationUser? Customer { get; set; }

        [Required]
        public int FoodId { get; set; }

        [ForeignKey(nameof(FoodId))]
        public Food? Food { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}