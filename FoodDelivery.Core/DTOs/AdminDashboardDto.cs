namespace FoodDelivery.Core.DTOs
{
    public class AdminDashboardDto
    {
        public int TotalCustomers { get; set; }

        public int TotalRestaurantOwners { get; set; }

        public int TotalDeliveryRiders { get; set; }

        public int TotalRestaurants { get; set; }

        public int TotalFoods { get; set; }

        public int TotalOrders { get; set; }

        public decimal TotalRevenue { get; set; }
    }
}