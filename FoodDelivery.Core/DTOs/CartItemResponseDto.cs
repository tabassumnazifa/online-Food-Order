namespace FoodDelivery.Core.DTOs
{
    public class CartItemResponseDto
    {
        public int Id { get; set; }

        public int FoodId { get; set; }

        public string FoodName { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public decimal TotalPrice { get; set; }
    }
}