using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        // One category can have many food items
        public ICollection<Food> Foods { get; set; } = new List<Food>();
    }
}