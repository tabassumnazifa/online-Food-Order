using FoodDelivery.Core.Enums;

namespace FoodDelivery.Core.DTOs
{
    public class OrderDetailsDto
    {
        public int Id { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string RestaurantName { get; set; } = string.Empty;

        public string RiderName { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }

        public string DeliveryAddress { get; set; } = string.Empty;

        public OrderStatus OrderStatus { get; set; }

        public PaymentStatus PaymentStatus { get; set; }

        public DateTime OrderDate { get; set; }
    }
}