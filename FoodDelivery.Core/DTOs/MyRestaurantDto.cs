namespace FoodDelivery.Core.DTOs
{
    public class MyRestaurantDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;
        public bool IsSuspended { get; set; }
    }
}