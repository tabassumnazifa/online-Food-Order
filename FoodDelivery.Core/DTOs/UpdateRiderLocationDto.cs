using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class UpdateRiderLocationDto
    {
        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }
    }
}