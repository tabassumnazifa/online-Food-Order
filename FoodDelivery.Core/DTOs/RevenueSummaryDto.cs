namespace FoodDelivery.Core.DTOs
{
    public class RevenueSummaryDto
    {
        public decimal TotalRevenue { get; set; }

        public int TotalPayments { get; set; }

        public int SuccessfulPayments { get; set; }

        public int PendingPayments { get; set; }

        public int FailedPayments { get; set; }
    }
}