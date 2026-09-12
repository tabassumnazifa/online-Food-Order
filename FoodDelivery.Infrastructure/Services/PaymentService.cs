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
            ? "https://sandbox-gw.sslcommerz.com/gwprocess/v4/api.php"
            : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

        var customerName =
            string.IsNullOrWhiteSpace(order.Customer?.FullName)
                ? "Customer"
                : order.Customer.FullName;

        var customerEmail =
            string.IsNullOrWhiteSpace(order.Customer?.Email)
                ? "customer@email.com"
                : order.Customer.Email;

        var deliveryAddress =
            string.IsNullOrWhiteSpace(order.DeliveryAddress)
                ? "Dhaka"
                : order.DeliveryAddress;

        var request = new Dictionary<string, string>
        {
            { "store_id", _settings.StoreId },
            { "store_passwd", _settings.StorePassword },
            { "total_amount", order.TotalAmount.ToString("0.00") },
            { "currency", "BDT" },
            { "tran_id", transactionId },

            // Callback URLs
            { "success_url", _settings.SuccessUrl },
            { "fail_url", _settings.FailUrl },
            { "cancel_url", _settings.CancelUrl },
            { "ipn_url", _settings.IPNUrl },

            // Customer information
            { "cus_name", customerName },
            { "cus_email", customerEmail },
            { "cus_phone", "01700000000" },
            { "cus_add1", deliveryAddress },
            { "cus_city", "Dhaka" },
            { "cus_country", "Bangladesh" },

            // Shipping information
            { "shipping_method", "Courier" },
            { "ship_name", customerName },
            { "ship_add1", deliveryAddress },
            { "ship_city", "Dhaka" },
            { "ship_country", "Bangladesh" },

            // Product information
            { "product_name", "Food Order" },
            { "product_category", "Food" },
            { "product_profile", "general" }
        };

        var response = await _httpClient.PostAsync(
            paymentUrl,
            new FormUrlEncodedContent(request)
        );

        var json = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception(
                $"SSLCommerz request failed: {json}"
            );
        }

        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        if (root.TryGetProperty("status", out var status))
        {
            var statusValue = status.GetString();

            if (!string.Equals(
                    statusValue,
                    "SUCCESS",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception(
                    $"SSLCommerz Error: {json}"
                );
            }
        }

        if (root.TryGetProperty(
                "GatewayPageURL",
                out var gateway))
        {
            var url = gateway.GetString();

            if (!string.IsNullOrWhiteSpace(url))
            {
                return url;
            }
        }

        throw new Exception(
            $"SSLCommerz payment URL not found. Response: {json}"
        );
    }

    // ==========================================================
    // VALIDATE PAYMENT
    // ==========================================================

    public async Task<bool> ValidatePaymentAsync(
        string valId)
    {
        if (string.IsNullOrWhiteSpace(valId))
        {
            return false;
        }

        var validationUrl =
            $"{_settings.ValidationUrl}" +
            $"?val_id={Uri.EscapeDataString(valId)}" +
            $"&store_id={Uri.EscapeDataString(_settings.StoreId)}" +
            $"&store_passwd={Uri.EscapeDataString(_settings.StorePassword)}" +
            $"&format=json";

        var response =
            await _httpClient.GetAsync(validationUrl);

        if (!response.IsSuccessStatusCode)
        {
            return false;
        }

        var json =
            await response.Content.ReadAsStringAsync();

        using var document =
            JsonDocument.Parse(json);

        var root =
            document.RootElement;

        if (root.TryGetProperty(
                "status",
                out var status))
        {
            return string.Equals(
                status.GetString(),
                "VALID",
                StringComparison.OrdinalIgnoreCase
            );
        }

        return false;
    }

    // ==========================================================
    // GET PAYMENT VALIDATION DETAILS
    // ==========================================================

    public async Task<PaymentValidationResult?>
        GetPaymentValidationAsync(
            string valId)
    {
        if (string.IsNullOrWhiteSpace(valId))
        {
            return null;
        }

        var validationUrl =
            $"{_settings.ValidationUrl}" +
            $"?val_id={Uri.EscapeDataString(valId)}" +
            $"&store_id={Uri.EscapeDataString(_settings.StoreId)}" +
            $"&store_passwd={Uri.EscapeDataString(_settings.StorePassword)}" +
            $"&format=json";

        var response =
            await _httpClient.GetAsync(validationUrl);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var json =
            await response.Content.ReadAsStringAsync();

        using var document =
            JsonDocument.Parse(json);

        var root =
            document.RootElement;

        var result =
            new PaymentValidationResult
            {
                IsValid = false,
                ValidationId = valId
            };

        if (root.TryGetProperty(
                "status",
                out var status))
        {
            result.IsValid =
                string.Equals(
                    status.GetString(),
                    "VALID",
                    StringComparison.OrdinalIgnoreCase
                );
        }

        if (root.TryGetProperty(
                "tran_id",
                out var tranId))
        {
            result.TransactionId =
                tranId.GetString();
        }

        if (root.TryGetProperty(
                "val_id",
                out var returnedValId))
        {
            result.ValidationId =
                returnedValId.GetString();
        }

        if (root.TryGetProperty(
                "bank_tran_id",
                out var bankTranId))
        {
            result.BankTransactionId =
                bankTranId.GetString();
        }

        if (root.TryGetProperty(
                "amount",
                out var amount))
        {
            if (decimal.TryParse(
                    amount.GetString(),
                    out var parsedAmount))
            {
                result.Amount = parsedAmount;
            }
        }

        if (root.TryGetProperty(
                "error",
                out var error))
        {
            result.ErrorReason =
                error.GetString();
        }

        return result;
    }

    // ==========================================================
    // INITIATE REFUND
    // ==========================================================

    public async Task<RefundResult> InitiateRefundAsync(
        Payment payment,
        string reason)
    {
        if (payment == null)
        {
            return new RefundResult
            {
                Success = false,
                Status = "failed",
                ErrorReason =
                    "Payment information is required."
            };
        }

        if (string.IsNullOrWhiteSpace(
                payment.BankTransactionId))
        {
            return new RefundResult
            {
                Success = false,
                Status = "failed",
                ErrorReason =
                    "SSLCommerz bank transaction ID is missing."
            };
        }

        if (payment.Amount <= 0)
        {
            return new RefundResult
            {
                Success = false,
                Status = "failed",
                ErrorReason =
                    "Refund amount must be greater than zero."
            };
        }

        if (string.IsNullOrWhiteSpace(reason))
        {
            reason = "Order cancelled.";
        }

        if (reason.Length > 255)
        {
            reason = reason[..255];
        }

        var refundUrl = _settings.IsSandbox
            ? "https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php"
            : "https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php";

        var refundTransactionId =
            $"REF-{payment.OrderId}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

        var queryParameters =
            new Dictionary<string, string>
            {
                {
                    "bank_tran_id",
                    payment.BankTransactionId
                },
                {
                    "refund_trans_id",
                    refundTransactionId
                },
                {
                    "refund_amount",
                    payment.Amount.ToString("0.00")
                },
                {
                    "refund_remarks",
                    reason
                },
                {
                    "store_id",
                    _settings.StoreId
                },
                {
                    "store_passwd",
                    _settings.StorePassword
                },
                {
                    "refe_id",
                    payment.OrderId.ToString()
                },
                {
                    "v",
                    "1"
                },
                {
                    "format",
                    "json"
                }
            };

        var queryString =
            string.Join(
                "&",
                queryParameters.Select(
                    item =>
                        $"{Uri.EscapeDataString(item.Key)}=" +
                        $"{Uri.EscapeDataString(item.Value)}"
                )
            );

        var requestUrl =
            $"{refundUrl}?{queryString}";

        var response =
            await _httpClient.GetAsync(requestUrl);

        var json =
            await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return new RefundResult
            {
                Success = false,
                Status = "failed",
                ErrorReason =
                    $"SSLCommerz refund request failed: {json}"
            };
        }

        using var document =
            JsonDocument.Parse(json);

        var root =
            document.RootElement;

        string? statusValue = null;
        string? refundReferenceId = null;
        string? bankTransactionId = null;
        string? errorReason = null;

        if (root.TryGetProperty(
                "status",
                out var status))
        {
            statusValue =
                status.GetString();
        }

        if (root.TryGetProperty(
                "refund_ref_id",
                out var refundRefId))
        {
            refundReferenceId =
                refundRefId.GetString();
        }

        if (root.TryGetProperty(
                "bank_tran_id",
                out var bankTranId))
        {
            bankTransactionId =
                bankTranId.GetString();
        }

        if (root.TryGetProperty(
                "errorReason",
                out var error))
        {
            errorReason =
                error.GetString();
        }

        var success =
            string.Equals(
                statusValue,
                "success",
                StringComparison.OrdinalIgnoreCase
            )
            ||
            string.Equals(
                statusValue,
                "processing",
                StringComparison.OrdinalIgnoreCase
            );

        return new RefundResult
        {
            Success = success,
            Status = statusValue,
            RefundReferenceId = refundReferenceId,
            BankTransactionId = bankTransactionId,
            ErrorReason = errorReason
        };
    }

    // ==========================================================
    // CHECK REFUND STATUS
    // ==========================================================

    public async Task<RefundResult> CheckRefundStatusAsync(
        string refundReferenceId)
    {
        if (string.IsNullOrWhiteSpace(
                refundReferenceId))
        {
            return new RefundResult
            {
                Success = false,
                Status = "failed",
                ErrorReason =
                    "Refund reference ID is required."
            };
        }

        var refundUrl = _settings.IsSandbox
            ? "https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php"
            : "https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php";

        var queryParameters =
            new Dictionary<string, string>
            {
                {
                    "refund_ref_id",
                    refundReferenceId
                },
                {
                    "store_id",
                    _settings.StoreId
                },
                {
                    "store_passwd",
                    _settings.StorePassword
                },
                {
                    "format",
                    "json"
                }
            };

        var queryString =
            string.Join(
                "&",
                queryParameters.Select(
                    item =>
                        $"{Uri.EscapeDataString(item.Key)}=" +
                        $"{Uri.EscapeDataString(item.Value)}"
                )
            );

        var requestUrl =
            $"{refundUrl}?{queryString}";

        var response =
            await _httpClient.GetAsync(requestUrl);

        var json =
            await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return new RefundResult
            {
                Success = false,
                Status = "failed",
                ErrorReason =
                    $"SSLCommerz refund status request failed: {json}"
            };
        }

        using var document =
            JsonDocument.Parse(json);

        var root =
            document.RootElement;

        string? statusValue = null;
        string? bankTransactionId = null;
        string? errorReason = null;

        if (root.TryGetProperty(
                "status",
                out var status))
        {
            statusValue =
                status.GetString();
        }

        if (root.TryGetProperty(
                "bank_tran_id",
                out var bankTranId))
        {
            bankTransactionId =
                bankTranId.GetString();
        }

        if (root.TryGetProperty(
                "errorReason",
                out var error))
        {
            errorReason =
                error.GetString();
        }

        var success =
            string.Equals(
                statusValue,
                "refunded",
                StringComparison.OrdinalIgnoreCase
            )
            ||
            string.Equals(
                statusValue,
                "processing",
                StringComparison.OrdinalIgnoreCase
            );

        return new RefundResult
        {
            Success = success,
            Status = statusValue,
            RefundReferenceId = refundReferenceId,
            BankTransactionId = bankTransactionId,
            ErrorReason = errorReason
        };
    }
}


}
