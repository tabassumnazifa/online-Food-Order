namespace FoodDelivery.Core.DTOs
{
    public class OfferDto
    {
        public int Id { get; set; }


        public string Title { get; set; } = string.Empty;


        public string? Description { get; set; }


        public string CouponCode { get; set; } = string.Empty;



        public decimal DiscountPercentage { get; set; }


        public decimal? MaximumDiscount { get; set; }



        public DateTime StartDate { get; set; }


        public DateTime EndDate { get; set; }


        public bool IsActive { get; set; }



        public int? RestaurantId { get; set; }


        public string RestaurantName { get; set; } = "Platform Offer";
    }
}