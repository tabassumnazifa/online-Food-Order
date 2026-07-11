namespace FoodDelivery.Core.DTOs
{
    public class RiderDashboardDto
    {
        public int AvailableOrders { get; set; }

        public int ActiveOrders { get; set; }

        public int CompletedOrders { get; set; }

        public int TotalDeliveries { get; set; }
    }
}