namespace FoodDelivery.Core.DTOs
{
    public class ValidateCouponDto
    {
        public string CouponCode { get; set; } = string.Empty;
        public int RestaurantId { get; set; }
        public decimal CartTotal { get; set; }
    }
}