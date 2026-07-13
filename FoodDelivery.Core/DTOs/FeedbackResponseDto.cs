namespace FoodDelivery.Core.DTOs
{
    public class FeedbackResponseDto
    {
        public int FeedbackId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string RestaurantName { get; set; } = string.Empty;

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}