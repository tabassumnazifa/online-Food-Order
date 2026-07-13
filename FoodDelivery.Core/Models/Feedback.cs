using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDelivery.Core.Models
{
    public class Feedback
    {
        [Key]
        public int Id { get; set; }

        // =========================
        // CUSTOMER
        // =========================
        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [ForeignKey(nameof(CustomerId))]
        public ApplicationUser? Customer { get; set; }

        // =========================
        // RESTAURANT
        // =========================
        [Required]
        public int RestaurantId { get; set; }

        [ForeignKey(nameof(RestaurantId))]
        public Restaurant? Restaurant { get; set; }

        // =========================
        // FEEDBACK
        // =========================
        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(500)]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}