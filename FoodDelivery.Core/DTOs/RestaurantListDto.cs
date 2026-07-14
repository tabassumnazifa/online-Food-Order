namespace FoodDelivery.Core.DTOs
{
    public class RestaurantListDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string OwnerName { get; set; } = string.Empty;

        public int TotalFoods { get; set; }

        public double AverageRating { get; set; }
    }
}