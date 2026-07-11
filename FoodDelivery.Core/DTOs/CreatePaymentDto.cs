using FoodDelivery.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace FoodDelivery.Core.DTOs
{
    public class CreatePaymentDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }
    }
}