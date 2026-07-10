namespace FoodDelivery.Core.DTOs
{
    public class OrderHistoryDto
    {
        public int OrderId { get; set; }

        public string RestaurantName { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}