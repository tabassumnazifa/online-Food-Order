using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class UpdateOfferDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;


        public string? Description { get; set; }


        [Required]
        public string CouponCode { get; set; } = string.Empty;



        [Range(0,100)]
        public decimal DiscountPercentage { get; set; }


        public decimal? MaximumDiscount { get; set; }



        public DateTime StartDate { get; set; }


        public DateTime EndDate { get; set; }



        public bool IsActive { get; set; }



        public int? RestaurantId { get; set; }
    }
}