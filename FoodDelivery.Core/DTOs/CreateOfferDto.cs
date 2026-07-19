using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class CreateOfferDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;


        public string? Description { get; set; }


        [Required]
        public string CouponCode { get; set; } = string.Empty;



        [Range(0, 100)]
        public decimal DiscountPercentage { get; set; }


        public decimal? MaximumDiscount { get; set; }



        [Required]
        public DateTime StartDate { get; set; }


        [Required]
        public DateTime EndDate { get; set; }



        // null = platform offer
        public int? RestaurantId { get; set; }
    }
}