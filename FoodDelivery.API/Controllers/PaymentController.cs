using System.Security.Claims;
using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Enums;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
using FoodDelivery.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Customer)]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPaymentService _paymentService;

        public PaymentController(
            ApplicationDbContext context,
            IPaymentService paymentService)
        {
            _context = context;
            _paymentService = paymentService;
        }

        // ==========================================================
        // CREATE PAYMENT
        // ==========================================================

        [HttpPost("pay")]
        public async Task<IActionResult> Pay(
            [FromBody] CreatePaymentDto model)
        {
            if (model == null)
            {
                return BadRequest("Payment information is required.");
            }

            if (!Enum.IsDefined(
                    typeof(PaymentMethod),
                    model.PaymentMethod))
            {
                return BadRequest("Invalid payment method.");
            }

            var customerId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            var order = await _context.Orders
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.Id == model.OrderId);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            if (order.CustomerId != customerId)
            {
                return Forbid();
            }

            var existingPayment =
                await _context.Payments
                    .FirstOrDefaultAsync(
                        p => p.OrderId == order.Id);

            if (existingPayment != null)
            {
                return BadRequest(
                    "Payment already exists for this order.");
            }

            // ======================================================
            // CASH ON DELIVERY
            // ======================================================

            if (model.PaymentMethod ==
                PaymentMethod.CashOnDelivery)
            {
                var payment = new Payment
                {
                    OrderId = order.Id,
                    CustomerId = customerId,
                    Amount = order.TotalAmount,

                    PaymentMethod =
                        PaymentMethod.CashOnDelivery,

                    PaymentStatus =
                        PaymentStatus.Pending,

                    PaymentDate =
                        DateTime.UtcNow
                };

                _context.Payments.Add(payment);

                await _context.SaveChangesAsync();

                return Ok(CreateResponse(payment));
            }

            // ======================================================
            // ONLINE PAYMENT
            // ======================================================

            var transactionId =
                $"FD-{order.Id}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

            var onlinePayment = new Payment
            {
                OrderId = order.Id,
                CustomerId = customerId,
                Amount = order.TotalAmount,

                PaymentMethod =
                    model.PaymentMethod,

                PaymentStatus =
                    PaymentStatus.Pending,

                TransactionId =
                    transactionId,

                PaymentDate =
                    DateTime.UtcNow
            };

            _context.Payments.Add(onlinePayment);

            await _context.SaveChangesAsync();

            try
            {
                var gatewayUrl =
                    await _paymentService.InitiatePaymentAsync(
                        order,
                        transactionId);

                return Ok(new
                {
                    message =
                        "Redirect customer to SSLCommerz.",

                    paymentId =
                        onlinePayment.Id,

                    transactionId,

                    paymentUrl =
                        gatewayUrl
                });
            }
            catch (Exception ex)
            {
                onlinePayment.PaymentStatus =
                    PaymentStatus.Failed;

                await _context.SaveChangesAsync();

                // Return the actual gateway error during development.
                return BadRequest(new
                {
                    message =
                        "Payment initialization failed.",

                    error =
                        ex.Message
                });
            }
        }

        // ==========================================================
        // CUSTOMER PAYMENT HISTORY
        // ==========================================================

        [HttpGet("my-payments")]
        public async Task<IActionResult> MyPayments()
        {
            var customerId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            var payments = await _context.Payments
                .Where(p => p.CustomerId == customerId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentResponseDto
                {
                    PaymentId = p.Id,
                    OrderId = p.OrderId,
                    Amount = p.Amount,

                    PaymentMethod =
                        p.PaymentMethod.ToString(),

                    PaymentStatus =
                        p.PaymentStatus.ToString(),

                    TransactionId =
                        p.TransactionId,

                    PaymentDate =
                        p.PaymentDate
                })
                .ToListAsync();

            return Ok(payments);
        }

        // ==========================================================
        // GET PAYMENT DETAILS
        // ==========================================================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPayment(int id)
        {
            var customerId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            var payment = await _context.Payments
                .Where(p =>
                    p.Id == id &&
                    p.CustomerId == customerId)
                .Select(p => new PaymentResponseDto
                {
                    PaymentId = p.Id,
                    OrderId = p.OrderId,
                    Amount = p.Amount,

                    PaymentMethod =
                        p.PaymentMethod.ToString(),

                    PaymentStatus =
                        p.PaymentStatus.ToString(),

                    TransactionId =
                        p.TransactionId,

                    PaymentDate =
                        p.PaymentDate
                })
                .FirstOrDefaultAsync();

            if (payment == null)
            {
                return NotFound();
            }

            return Ok(payment);
        }

        // ==========================================================
        // SSL COMMERZ SUCCESS
        // ==========================================================

        [AllowAnonymous]
        [HttpPost("success")]
        public async Task<IActionResult> Success(
            [FromForm] string tran_id,
            [FromForm] string? val_id)
        {
            if (string.IsNullOrWhiteSpace(tran_id))
            {
                return BadRequest(
                    "Transaction ID is required.");
            }

            var payment =
                await _context.Payments
                    .FirstOrDefaultAsync(
                        p => p.TransactionId == tran_id);

            if (payment == null)
            {
                return NotFound("Payment not found.");
            }

            if (string.IsNullOrWhiteSpace(val_id))
            {
                return BadRequest(
                    "SSLCommerz validation ID is missing.");
            }

            var validation =
                await _paymentService
                    .GetPaymentValidationAsync(val_id);

            if (validation == null ||
                !validation.IsValid)
            {
                return BadRequest(
                    "Payment validation failed.");
            }

            // Make sure the validation response belongs
            // to our original transaction.
            if (!string.IsNullOrWhiteSpace(
                    validation.TransactionId) &&
                !string.Equals(
                    validation.TransactionId,
                    payment.TransactionId,
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(
                    "Payment transaction verification failed.");
            }

            payment.BankTransactionId =
                validation.BankTransactionId;

            payment.PaymentStatus =
                PaymentStatus.Paid;

            // IMPORTANT:
            // Keep payment.TransactionId as the original
            // merchant transaction ID.
            // Do NOT replace it with val_id.

            var order =
                await _context.Orders
                    .FindAsync(payment.OrderId);

            if (order != null)
            {
                order.OrderStatus =
                    OrderStatus.Accepted;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Payment successful.",

                orderId =
                    payment.OrderId,

                paymentId =
                    payment.Id,

                transactionId =
                    payment.TransactionId,

                validationId =
                    validation.ValidationId,

                bankTransactionId =
                    payment.BankTransactionId
            });
        }

        // ==========================================================
        // FAILED
        // ==========================================================

        [AllowAnonymous]
        [HttpPost("fail")]
        public async Task<IActionResult> Fail(
            [FromForm] string tran_id)
        {
            if (string.IsNullOrWhiteSpace(tran_id))
            {
                return BadRequest(
                    "Transaction ID is required.");
            }

            var payment =
                await _context.Payments
                    .FirstOrDefaultAsync(
                        p => p.TransactionId == tran_id);

            if (payment != null)
            {
                payment.PaymentStatus =
                    PaymentStatus.Failed;

                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message =
                    "Payment failed."
            });
        }

        // ==========================================================
        // CANCEL SSL COMMERZ PAYMENT
        // ==========================================================

        [AllowAnonymous]
        [HttpPost("cancel")]
        public async Task<IActionResult> Cancel(
            [FromForm] string tran_id)
        {
            if (string.IsNullOrWhiteSpace(tran_id))
            {
                return BadRequest(
                    "Transaction ID is required.");
            }

            var payment =
                await _context.Payments
                    .FirstOrDefaultAsync(
                        p => p.TransactionId == tran_id);

            if (payment != null)
            {
                payment.PaymentStatus =
                    PaymentStatus.Cancelled;

                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message =
                    "Payment cancelled."
            });
        }

        // ==========================================================
        // IPN
        // ==========================================================

        [AllowAnonymous]
        [HttpPost("ipn")]
        public async Task<IActionResult> IPN(
            [FromForm] string tran_id,
            [FromForm] string status,
            [FromForm] string? val_id)
        {
            if (string.IsNullOrWhiteSpace(tran_id))
            {
                return BadRequest(
                    "Transaction ID is required.");
            }

            var payment =
                await _context.Payments
                    .FirstOrDefaultAsync(
                        p => p.TransactionId == tran_id);

            if (payment == null)
            {
                return NotFound();
            }

            if (status.Equals(
                    "VALID",
                    StringComparison.OrdinalIgnoreCase)
                &&
                !string.IsNullOrWhiteSpace(val_id))
            {
                var validation =
                    await _paymentService
                        .GetPaymentValidationAsync(val_id);

                if (validation != null &&
                    validation.IsValid)
                {
                    if (!string.IsNullOrWhiteSpace(
                            validation.TransactionId) &&
                        !string.Equals(
                            validation.TransactionId,
                            payment.TransactionId,
                            StringComparison.OrdinalIgnoreCase))
                    {
                        payment.PaymentStatus =
                            PaymentStatus.Failed;

                        await _context.SaveChangesAsync();

                        return BadRequest(
                            "Payment transaction verification failed.");
                    }

                    payment.PaymentStatus =
                        PaymentStatus.Paid;

                    payment.BankTransactionId =
                        validation.BankTransactionId;

                    // Keep original TransactionId.
                    // Do not replace it with val_id.

                    var order =
                        await _context.Orders
                            .FindAsync(payment.OrderId);

                    if (order != null)
                    {
                        order.OrderStatus =
                            OrderStatus.Accepted;
                    }
                }
                else
                {
                    payment.PaymentStatus =
                        PaymentStatus.Failed;
                }
            }
            else
            {
                payment.PaymentStatus =
                    PaymentStatus.Failed;
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

        // ==========================================================
        // REFUND CUSTOMER PAYMENT
        // ==========================================================

        [HttpPost("refund/{orderId}")]
        public async Task<IActionResult> Refund(
            int orderId,
            [FromBody] string? reason)
        {
            var customerId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            var order =
                await _context.Orders
                    .FirstOrDefaultAsync(
                        o =>
                            o.Id == orderId &&
                            o.CustomerId == customerId);

            if (order == null)
            {
                return NotFound(
                    "Order not found.");
            }

            if (order.OrderStatus !=
                OrderStatus.Cancelled)
            {
                return BadRequest(
                    "Refund is only available for cancelled orders.");
            }

            var payment =
                await _context.Payments
                    .FirstOrDefaultAsync(
                        p =>
                            p.OrderId == orderId &&
                            p.CustomerId == customerId);

            if (payment == null)
            {
                return NotFound(
                    "Payment not found.");
            }

            if (payment.PaymentMethod ==
                PaymentMethod.CashOnDelivery)
            {
                return BadRequest(
                    "Cash on Delivery orders do not require a refund.");
            }

            if (payment.PaymentStatus !=
                PaymentStatus.Paid)
            {
                return BadRequest(
                    "Only paid online payments can be refunded.");
            }

            if (string.IsNullOrWhiteSpace(
                    payment.BankTransactionId))
            {
                return BadRequest(
                    "SSLCommerz bank transaction ID is missing.");
            }

            // Prevent duplicate refund requests.
            if (!string.IsNullOrWhiteSpace(
                    payment.RefundReferenceId))
            {
                return BadRequest(
                    "A refund has already been requested for this payment.");
            }

            var refundReason =
                string.IsNullOrWhiteSpace(reason)
                    ? "Order cancelled."
                    : reason;

            var refundResult =
                await _paymentService
                    .InitiateRefundAsync(
                        payment,
                        refundReason);

            if (!refundResult.Success)
            {
                return BadRequest(new
                {
                    message =
                        "Refund request failed.",

                    status =
                        refundResult.Status,

                    error =
                        refundResult.ErrorReason
                });
            }

            // Save refund information.
            payment.RefundReferenceId =
                refundResult.RefundReferenceId;

            payment.RefundStatus =
                refundResult.Status;

            payment.RefundDate =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Refund request submitted successfully.",

                orderId,

                amount =
                    payment.Amount,

                refundStatus =
                    payment.RefundStatus,

                refundReferenceId =
                    payment.RefundReferenceId,

                bankTransactionId =
                    payment.BankTransactionId
            });
        }

        // ==========================================================
        // CHECK REFUND STATUS
        // ==========================================================

        [HttpGet("refund-status/{refundReferenceId}")]
        public async Task<IActionResult> CheckRefundStatus(
            string refundReferenceId)
        {
            if (string.IsNullOrWhiteSpace(
                    refundReferenceId))
            {
                return BadRequest(
                    "Refund reference ID is required.");
            }

            var customerId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            var payment =
                await _context.Payments
                    .FirstOrDefaultAsync(
                        p =>
                            p.CustomerId == customerId &&
                            p.RefundReferenceId ==
                                refundReferenceId);

            if (payment == null)
            {
                return NotFound(
                    "Refund record not found.");
            }

            var refundResult =
                await _paymentService
                    .CheckRefundStatusAsync(
                        refundReferenceId);

            // Keep our database status synchronized.
            payment.RefundStatus =
                refundResult.Status;

            if (!string.IsNullOrWhiteSpace(
                    refundResult.BankTransactionId))
            {
                payment.BankTransactionId =
                    refundResult.BankTransactionId;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                refundReferenceId,

                status =
                    refundResult.Status,

                success =
                    refundResult.Success,

                bankTransactionId =
                    refundResult.BankTransactionId,

                error =
                    refundResult.ErrorReason
            });
        }

        // ==========================================================
        // PRIVATE METHOD
        // ==========================================================

        private static PaymentResponseDto CreateResponse(
            Payment payment)
        {
            return new PaymentResponseDto
            {
                PaymentId =
                    payment.Id,

                OrderId =
                    payment.OrderId,

                Amount =
                    payment.Amount,

                PaymentMethod =
                    payment.PaymentMethod.ToString(),

                PaymentStatus =
                    payment.PaymentStatus.ToString(),

                TransactionId =
                    payment.TransactionId,

                PaymentDate =
                    payment.PaymentDate
            };
        }
    }
}
