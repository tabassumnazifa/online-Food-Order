using System.Text.Json;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Settings;
using Microsoft.Extensions.Options;

namespace FoodDelivery.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly HttpClient _httpClient;
        private readonly SSLCommerzSettings _settings;


        public PaymentService(
            HttpClient httpClient,
            IOptions<SSLCommerzSettings> settings)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
        }



        // ==========================================================
        // INITIATE SSL COMMERZ PAYMENT
        // ==========================================================

        public async Task<string> InitiatePaymentAsync(
            Order order,
            string transactionId)
        {
            var paymentUrl = _settings.IsSandbox
                ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
                : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";



            var request = new Dictionary<string, string>
            {
                {
                    "store_id",
                    _settings.StoreId
                },

                {
                    "store_passwd",
                    _settings.StorePassword
                },


                {
                    "total_amount",
                    order.TotalAmount.ToString("0.00")
                },

                {
                    "currency",
                    "BDT"
                },


                // SAME ID SAVED IN DATABASE
                {
                    "tran_id",
                    transactionId
                },


                {
                    "success_url",
                    _settings.SuccessUrl
                },

                {
                    "fail_url",
                    _settings.FailUrl
                },

                {
                    "cancel_url",
                    _settings.CancelUrl
                },

                {
                    "ipn_url",
                    _settings.IPNUrl
                },


                {
                    "cus_name",
                    order.Customer?.FullName 
                    ?? "Customer"
                },

                {
                    "cus_email",
                    order.Customer?.Email
                    ?? "customer@email.com"
                },

                {
                    "cus_phone",
                    "01700000000"
                },


                {
                    "cus_add1",
                    order.DeliveryAddress
                },

                {
                    "cus_city",
                    "Dhaka"
                },

                {
                    "cus_country",
                    "Bangladesh"
                },


                {
                    "shipping_method",
                    "Courier"
                },

                {
                    "product_name",
                    "Food Order"
                },

                {
                    "product_category",
                    "Food"
                },

                {
                    "product_profile",
                    "general"
                }
            };



            var response =
                await _httpClient.PostAsync(
                    paymentUrl,
                    new FormUrlEncodedContent(request));



            response.EnsureSuccessStatusCode();



            var json =
                await response.Content.ReadAsStringAsync();



            using var document =
                JsonDocument.Parse(json);



            var root =
                document.RootElement;



            if(root.TryGetProperty(
                "status",
                out var status))
            {
                if(!string.Equals(
                    status.GetString(),
                    "SUCCESS",
                    StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception(
                        $"SSLCommerz Error: {json}");
                }
            }



            if(root.TryGetProperty(
                "GatewayPageURL",
                out var gateway))
            {
                var url = gateway.GetString();

                if(!string.IsNullOrWhiteSpace(url))
                {
                    return url;
                }
            }



            throw new Exception(
                "SSLCommerz payment URL not found.");
        }




        // ==========================================================
        // VALIDATE PAYMENT
        // ==========================================================

        public async Task<bool> ValidatePaymentAsync(
            string valId)
        {

            if(string.IsNullOrWhiteSpace(valId))
            {
                return false;
            }



            var validationUrl =
                $"{_settings.ValidationUrl}" +
                $"?val_id={valId}" +
                $"&store_id={_settings.StoreId}" +
                $"&store_passwd={_settings.StorePassword}" +
                $"&format=json";



            var response =
                await _httpClient.GetAsync(validationUrl);



            if(!response.IsSuccessStatusCode)
            {
                return false;
            }



            var json =
                await response.Content.ReadAsStringAsync();



            using var document =
                JsonDocument.Parse(json);



            if(document.RootElement
                .TryGetProperty(
                    "status",
                    out var status))
            {
                return string.Equals(
                    status.GetString(),
                    "VALID",
                    StringComparison.OrdinalIgnoreCase);
            }



            return false;
        }
    }
}