using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDelivery.Core.Models
{
    public class Restaurant
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(250)]
        public string? Address { get; set; }

        [Phone]
        public string? Phone { get; set; }

        public string? ImageUrl { get; set; }

        // Foreign Key → Restaurant Owner (ApplicationUser)
        [Required]
        public string OwnerId { get; set; } = string.Empty;

        [ForeignKey(nameof(OwnerId))]
        public ApplicationUser? Owner { get; set; }

        // One Restaurant can have many Food items
        public ICollection<Food> Foods { get; set; } = new List<Food>();
    }
}