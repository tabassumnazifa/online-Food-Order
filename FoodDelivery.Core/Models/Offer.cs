using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDelivery.Core.Models
{
    public class Offer
    {
        [Key]
        public int Id { get; set; }


        // =========================
        // OFFER INFORMATION
        // =========================

        [Required]
        public string Title { get; set; } = string.Empty;


        public string? Description { get; set; }


        [Required]
        public string CouponCode { get; set; } = string.Empty;



        // =========================
        // DISCOUNT
        // =========================

        public decimal DiscountPercentage { get; set; }


        public decimal? MaximumDiscount { get; set; }



        // =========================
        // VALIDITY
        // =========================

        public DateTime StartDate { get; set; }


        public DateTime EndDate { get; set; }


        public bool IsActive { get; set; } = true;



        // =========================
        // RESTAURANT OFFER
        // NULL = PLATFORM OFFER
        // =========================

        public int? RestaurantId { get; set; }


        [ForeignKey(nameof(RestaurantId))]
        public Restaurant? Restaurant { get; set; }
    }
}