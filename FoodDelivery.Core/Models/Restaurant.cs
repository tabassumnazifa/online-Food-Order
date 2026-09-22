using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDelivery.Core.Models
{
    public class Restaurant
    {
        [Key]
        public int Id { get; set; }


        // =========================
        // RESTAURANT INFORMATION
        // =========================

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
        // RESTAURANT SUSPENSION & VERIFICATION
        // =========================

        public bool IsSuspended { get; set; } = false;

        public string? SuspensionReason { get; set; }

        public DateTime? SuspendedAt { get; set; }

        
        public bool HasSubmittedDocuments { get; set; } = false;
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
        // ORDERS
        // =========================

        public ICollection<Order> Orders { get; set; }
            = new List<Order>();


        // =========================
        // FEEDBACKS
        // =========================

        public ICollection<Feedback> Feedbacks { get; set; }
            = new List<Feedback>();


        // =========================
        // OFFERS
        // =========================

        public ICollection<Offer> Offers { get; set; }
            = new List<Offer>();
    }
}