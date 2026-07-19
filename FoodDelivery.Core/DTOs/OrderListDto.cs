using FoodDelivery.Core.Enums;

namespace FoodDelivery.Core.DTOs
{
    public class OrderListDto
    {
        public int Id { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string RestaurantName { get; set; } = string.Empty;

        public string RiderName { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }

        public OrderStatus OrderStatus { get; set; }

        public PaymentStatus PaymentStatus { get; set; }

        public DateTime OrderDate { get; set; }
    }
}