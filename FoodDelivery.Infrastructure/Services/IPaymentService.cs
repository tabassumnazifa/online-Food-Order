using FoodDelivery.Core.Models;

namespace FoodDelivery.Infrastructure.Services
{
    public interface IPaymentService
    {
        // Initialize SSLCommerz payment
        Task<string> InitiatePaymentAsync(
            Order order,
            string transactionId);


        // Validate SSLCommerz payment after success callback
        Task<bool> ValidatePaymentAsync(
            string valId);
    }
}