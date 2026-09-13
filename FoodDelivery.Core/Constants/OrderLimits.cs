namespace FoodDelivery.Core.Constants
{
    /// <summary>
    /// Business rules that protect restaurants from
    /// impossible, accidental, or fraudulent orders.
    /// </summary>
    public static class OrderLimits
    {
        // Maximum quantity of the SAME dish in one order
        // (e.g. max 10 burgers of one type)
        public const int MaxQuantityPerItem = 10;

        // Maximum TOTAL items across the whole cart
        public const int MaxItemsPerOrder = 50;

        // Maximum order value in BDT (1 lakh)
        public const decimal MaxOrderValue = 100000m;
    }
}