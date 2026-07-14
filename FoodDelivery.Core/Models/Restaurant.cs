using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDelivery.Core.Models
{
    public class Restaurant
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(250)]
        public string? Address { get; set; }

        [Phone]
        public string? Phone { get; set; }

        public string? ImageUrl { get; set; }

        // =========================
        // RESTAURANT OWNER
        // =========================
        [Required]
        public string OwnerId { get; set; } = string.Empty;

        [ForeignKey(nameof(OwnerId))]
        public ApplicationUser? Owner { get; set; }

        // =========================
        // FOODS
        // =========================
        public ICollection<Food> Foods { get; set; }
            = new List<Food>();

        // =========================
        // FEEDBACKS
        // =========================
        public ICollection<Feedback> Feedbacks { get; set; }
            = new List<Feedback>();
    }
}