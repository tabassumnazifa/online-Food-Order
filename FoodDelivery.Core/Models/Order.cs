using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FoodDelivery.Core.Enums;

namespace FoodDelivery.Core.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }



        // =========================
        // CUSTOMER RELATION
        // =========================

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [ForeignKey(nameof(CustomerId))]
        public ApplicationUser? Customer { get; set; }



        // =========================
        // RESTAURANT RELATION
        // =========================

        [Required]
        public int RestaurantId { get; set; }

        [ForeignKey(nameof(RestaurantId))]
        public Restaurant? Restaurant { get; set; }



        // =========================
        // RIDER RELATION
        // =========================

        public string? RiderId { get; set; }

        [ForeignKey(nameof(RiderId))]
        public ApplicationUser? Rider { get; set; }



        // =========================
        // ORDER INFORMATION
        // =========================

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;


        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }



        // Actual database field
        [Required]
        public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;



        // Compatibility property
        // Used by existing controllers
        // Not stored in database
        [NotMapped]
        public string Status
        {
            get => OrderStatus.ToString();

            set
            {
                if (Enum.TryParse<OrderStatus>(
                    value,
                    true,
                    out var parsedStatus))
                {
                    OrderStatus = parsedStatus;
                }
            }
        }



        [Required]
        public string DeliveryAddress { get; set; } = string.Empty;



        // =========================
        // PAYMENT RELATION
        // =========================

        public Payment? Payment { get; set; }



        // =========================
        // ORDER ITEMS
        // =========================

        public ICollection<OrderItem> OrderItems { get; set; }
            = new List<OrderItem>();
    }
}