namespace FoodDelivery.Core.DTOs
{
    public class OrderResponseDto
    {
        public int Id { get; set; }

        public string CustomerId { get; set; } = string.Empty;

        public int RestaurantId { get; set; }

        public string RestaurantName { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}