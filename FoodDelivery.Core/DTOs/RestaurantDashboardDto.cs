namespace FoodDelivery.Core.DTOs
{
    public class RestaurantDashboardDto
    {
        public string RestaurantName { get; set; } = string.Empty;

        public int TotalFoods { get; set; }

        public int TotalCategories { get; set; }

        public int TotalOrders { get; set; }

        public int PendingOrders { get; set; }

        public int CompletedOrders { get; set; }

        public decimal TotalRevenue { get; set; }
    }
}