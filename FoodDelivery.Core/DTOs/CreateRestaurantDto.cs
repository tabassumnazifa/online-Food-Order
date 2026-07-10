namespace FoodDelivery.Core.DTOs
{
    public class CreateRestaurantDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
    }
}