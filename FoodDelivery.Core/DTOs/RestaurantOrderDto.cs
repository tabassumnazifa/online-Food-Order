namespace FoodDelivery.Core.DTOs
{
    public class RestaurantOrderDto
    {
        public int OrderId { get; set; }

        public string CustomerId { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}