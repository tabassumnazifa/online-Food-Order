namespace FoodDelivery.Core.DTOs
{
    public class AvailableOrderDto
    {
        public int OrderId { get; set; }

        public string RestaurantName { get; set; } = string.Empty;

        public string RestaurantAddress { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; }
    }
}