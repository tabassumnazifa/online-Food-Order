namespace FoodDelivery.Core.DTOs
{
    public class RestaurantDetailsDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Address { get; set; }

        public string? Phone { get; set; }

        public string OwnerName { get; set; } = string.Empty;

        public int TotalFoods { get; set; }

        public int TotalFeedbacks { get; set; }

        public double AverageRating { get; set; }
    }
}