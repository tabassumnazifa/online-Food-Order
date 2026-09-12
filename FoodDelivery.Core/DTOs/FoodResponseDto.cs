namespace FoodDelivery.Core.DTOs
{
    public class FoodResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public decimal Price { get; set; }

        public bool IsAvailable { get; set; }

        public int RestaurantId { get; set; }

        public string RestaurantName { get; set; } = string.Empty;
    }
}