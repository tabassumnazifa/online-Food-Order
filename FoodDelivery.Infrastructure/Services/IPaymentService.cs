using FoodDelivery.Core.Models;

namespace FoodDelivery.Infrastructure.Services
{
    public interface IPaymentService
    {
        // ==========================================================
        // INITIALIZE SSL COMMERZ PAYMENT
        // ==========================================================

        Task<string> InitiatePaymentAsync(
            Order order,
            string transactionId);


        // ==========================================================
        // VALIDATE SSL COMMERZ PAYMENT
        // ==========================================================

        Task<bool> ValidatePaymentAsync(
            string valId);


        // ==========================================================
        // GET PAYMENT VALIDATION DETAILS
        // ==========================================================

        Task<PaymentValidationResult?> GetPaymentValidationAsync(
            string valId);


        // ==========================================================
        // INITIATE REFUND
        // ==========================================================

        Task<RefundResult> InitiateRefundAsync(
            Payment payment,
            string reason);


        // ==========================================================
        // CHECK REFUND STATUS
        // ==========================================================

        Task<RefundResult> CheckRefundStatusAsync(
            string refundReferenceId);
    }


    // ==============================================================
    // PAYMENT VALIDATION RESULT
    // ==============================================================

    public class PaymentValidationResult
    {
        public bool IsValid { get; set; }

        public string? TransactionId { get; set; }

        public string? ValidationId { get; set; }

        public string? BankTransactionId { get; set; }

        public decimal Amount { get; set; }

        public string? ErrorReason { get; set; }
    }


    // ==============================================================
    // REFUND RESULT
    // ==============================================================

    public class RefundResult
    {
        public bool Success { get; set; }

        public string? Status { get; set; }

        public string? RefundReferenceId { get; set; }

        public string? BankTransactionId { get; set; }

        public string? ErrorReason { get; set; }
    }
}
