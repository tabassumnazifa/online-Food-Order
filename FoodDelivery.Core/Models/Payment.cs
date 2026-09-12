using FoodDelivery.Core.Enums;

namespace FoodDelivery.Core.Models
{
    public class Payment
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public Order? Order { get; set; }

        public string CustomerId { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public PaymentMethod PaymentMethod { get; set; }

        public PaymentStatus PaymentStatus { get; set; }

        // Our internal transaction ID
        public string? TransactionId { get; set; }

        // SSLCommerz bank transaction ID
        public string? BankTransactionId { get; set; }

        // SSLCommerz refund reference ID
        public string? RefundReferenceId { get; set; }

        // Refund status
        public string? RefundStatus { get; set; }

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        // When refund was requested
        public DateTime? RefundDate { get; set; }
    }
}