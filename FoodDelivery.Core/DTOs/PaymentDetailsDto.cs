using FoodDelivery.Core.Enums;

namespace FoodDelivery.Core.DTOs
{
    public class PaymentDetailsDto
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public PaymentMethod PaymentMethod { get; set; }

        public PaymentStatus PaymentStatus { get; set; }

        public DateTime PaymentDate { get; set; }
    }
}