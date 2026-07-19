using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDelivery.Core.Models
{
    public class Food
    {
        [Key]
        public int Id { get; set; }


        // =========================
        // FOOD INFORMATION
        // =========================

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;


        [MaxLength(500)]
        public string? Description { get; set; }


        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }


        public bool IsAvailable { get; set; } = true;



        // =========================
        // RESTAURANT RELATION
        // =========================

        [Required]
        public int RestaurantId { get; set; }


        [ForeignKey(nameof(RestaurantId))]
        public Restaurant? Restaurant { get; set; }



        // =========================
        // CATEGORY RELATION
        // =========================

        [Required]
        public int CategoryId { get; set; }


        [ForeignKey(nameof(CategoryId))]
        public Category? Category { get; set; }



        // =========================
        // ORDER ITEMS
        // =========================

        public ICollection<OrderItem> OrderItems { get; set; }
            = new List<OrderItem>();
    }
}