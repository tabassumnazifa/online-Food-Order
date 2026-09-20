using System;
using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        // Who is this notification for? (e.g., "Admin")
        public string RecipientRole { get; set; } = "Admin";

        // The message to display
        public string Message { get; set; } = string.Empty;

        // Link to the relevant entity (e.g., RestaurantId)
        public int? RelatedEntityId { get; set; }
        
        // Type of entity (e.g., "Restaurant")
        public string? RelatedEntityType { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}