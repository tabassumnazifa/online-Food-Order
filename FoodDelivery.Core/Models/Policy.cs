namespace FoodDelivery.Core.Models
{
    public class Policy
    {
        public int Id { get; set; }


        public string Title { get; set; } = string.Empty;


        public string Content { get; set; } = string.Empty;


        // PrivacyPolicy or TermsConditions
        public string Type { get; set; } = string.Empty;


        public DateTime UpdatedAt { get; set; }
            = DateTime.UtcNow;
    }
}