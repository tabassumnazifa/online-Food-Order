namespace FoodDelivery.Core.DTOs
{
    public class RiderLocationDto
    {
        public string RiderId { get; set; } = string.Empty;

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}