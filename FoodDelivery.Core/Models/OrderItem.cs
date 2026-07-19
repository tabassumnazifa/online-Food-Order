using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDelivery.Core.Models
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }



        // =========================
        // ORDER RELATION
        // =========================
        [Required]
        public int OrderId { get; set; }

        [ForeignKey(nameof(OrderId))]
        public Order? Order { get; set; }



        // =========================
        // FOOD RELATION
        // =========================
        [Required]
        public int FoodId { get; set; }

        [ForeignKey(nameof(FoodId))]
        public Food? Food { get; set; }



        // =========================
        // ITEM INFORMATION
        // =========================
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }


        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }
    }
}