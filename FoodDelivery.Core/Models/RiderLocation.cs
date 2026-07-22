using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDelivery.Core.Models
{
    public class RiderLocation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string RiderId { get; set; } = string.Empty;

        [ForeignKey(nameof(RiderId))]
        public ApplicationUser? Rider { get; set; }

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}