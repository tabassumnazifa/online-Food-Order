namespace FoodDelivery.Infrastructure.Settings
{
    public class SSLCommerzSettings
    {
        // =========================
        // STORE INFORMATION
        // =========================

        public string StoreId { get; set; } = string.Empty;

        public string StorePassword { get; set; } = string.Empty;


        // =========================
        // ENVIRONMENT
        // =========================

        public bool IsSandbox { get; set; }



        // =========================
        // CALLBACK URLS
        // =========================

        public string SuccessUrl { get; set; } = string.Empty;

        public string FailUrl { get; set; } = string.Empty;

        public string CancelUrl { get; set; } = string.Empty;

        public string IPNUrl { get; set; } = string.Empty;



        // =========================
        // PAYMENT VALIDATION API
        // =========================

        public string ValidationUrl { get; set; } = string.Empty;
    }
}