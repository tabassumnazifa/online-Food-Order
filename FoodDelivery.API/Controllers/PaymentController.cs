using System;
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
        public async Task<IActionResult> Pay([FromBody] CreatePaymentDto model)
        {
            if (model == null)
                return BadRequest("Payment information is required.");

            if (!Enum.IsDefined(typeof(PaymentMethod), model.PaymentMethod))
                return BadRequest("Invalid payment method.");

            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var order = await _context.Orders
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.Id == model.OrderId);

            if (order == null)
                return NotFound("Order not found.");

            if (order.CustomerId != customerId)
                return Forbid();

            var existingPayment = await _context.Payments
                .FirstOrDefaultAsync(p => p.OrderId == order.Id);

            if (existingPayment != null)
                return BadRequest("Payment already exists for this order.");

            // ======================================================
            // CASH ON DELIVERY
            // ======================================================
            if (model.PaymentMethod == PaymentMethod.CashOnDelivery)
            {
                var payment = new Payment
                {
                    OrderId = order.Id,
                    CustomerId = customerId,
                    Amount = order.TotalAmount,
                    PaymentMethod = PaymentMethod.CashOnDelivery,
                    PaymentStatus = PaymentStatus.Pending,
                    PaymentDate = DateTime.UtcNow
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                return Ok(CreateResponse(payment));
            }

            // ======================================================
            // ONLINE PAYMENT
            // ======================================================
            var transactionId = $"FD-{order.Id}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

            var onlinePayment = new Payment
            {
                OrderId = order.Id,
                CustomerId = customerId,
                Amount = order.TotalAmount,
                PaymentMethod = model.PaymentMethod,
                PaymentStatus = PaymentStatus.Pending,
                TransactionId = transactionId,
                PaymentDate = DateTime.UtcNow
            };

            _context.Payments.Add(onlinePayment);
            await _context.SaveChangesAsync();

            try
            {
                var gatewayUrl = await _paymentService.InitiatePaymentAsync(order, transactionId);

                return Ok(new
                {
                    message = "Redirect customer to SSLCommerz.",
                    paymentId = onlinePayment.Id,
                    transactionId,
                    paymentUrl = gatewayUrl
                });
            }
            catch (Exception ex)
            {
                onlinePayment.PaymentStatus = PaymentStatus.Failed;
                await _context.SaveChangesAsync();

                return BadRequest(new
                {
                    message = "Payment initialization failed.",
                    error = ex.Message
                });
            }
        }

        // ==========================================================
        // CUSTOMER PAYMENT HISTORY
        // ==========================================================

        [HttpGet("my-payments")]
        public async Task<IActionResult> MyPayments()
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var payments = await _context.Payments
                .Where(p => p.CustomerId == customerId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentResponseDto
                {
                    PaymentId = p.Id,
                    OrderId = p.OrderId,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod.ToString(),
                    PaymentStatus = p.PaymentStatus.ToString(),
                    TransactionId = p.TransactionId,
                    PaymentDate = p.PaymentDate
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
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var payment = await _context.Payments
                .Where(p => p.Id == id && p.CustomerId == customerId)
                .Select(p => new PaymentResponseDto
                {
                    PaymentId = p.Id,
                    OrderId = p.OrderId,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod.ToString(),
                    PaymentStatus = p.PaymentStatus.ToString(),
                    TransactionId = p.TransactionId,
                    PaymentDate = p.PaymentDate
                })
                .FirstOrDefaultAsync();

            if (payment == null)
                return NotFound();

            return Ok(payment);
        }

        // ==========================================================
        // SSL COMMERZ SUCCESS (REDIRECTS TO FRONTEND)
        // ==========================================================

        [AllowAnonymous]
        [HttpPost("success")]
        public async Task<IActionResult> Success(
            [FromForm] string tran_id,
            [FromForm] string? val_id)
        {
            if (string.IsNullOrWhiteSpace(tran_id))
                return Redirect("http://localhost:5173/payment/fail");

            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.TransactionId == tran_id);
            if (payment == null)
                return Redirect("http://localhost:5173/payment/fail");

            if (string.IsNullOrWhiteSpace(val_id))
                return Redirect("http://localhost:5173/payment/fail");

            var validation = await _paymentService.GetPaymentValidationAsync(val_id);

            if (validation == null || !validation.IsValid)
            {
                payment.PaymentStatus = PaymentStatus.Failed;
                await _context.SaveChangesAsync();
                return Redirect("http://localhost:5173/payment/fail");
            }

            if (!string.IsNullOrWhiteSpace(validation.TransactionId) &&
                !string.Equals(validation.TransactionId, payment.TransactionId, StringComparison.OrdinalIgnoreCase))
            {
                payment.PaymentStatus = PaymentStatus.Failed;
                await _context.SaveChangesAsync();
                return Redirect("http://localhost:5173/payment/fail");
            }

            payment.BankTransactionId = validation.BankTransactionId;
            payment.PaymentStatus = PaymentStatus.Paid;

            var order = await _context.Orders.FindAsync(payment.OrderId);
            if (order != null)
            {
                order.OrderStatus = OrderStatus.Accepted;
            }

            await _context.SaveChangesAsync();

            // ✅ REDIRECT TO FRONTEND SUCCESS PAGE
            return Redirect("http://localhost:5173/payment/success");
        }

        // ==========================================================
        // FAILED (REDIRECTS TO FRONTEND)
        // ==========================================================

        [AllowAnonymous]
        [HttpPost("fail")]
        public async Task<IActionResult> Fail([FromForm] string tran_id)
        {
            if (string.IsNullOrWhiteSpace(tran_id))
                return Redirect("http://localhost:5173/payment/fail");

            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.TransactionId == tran_id);

            if (payment != null)
            {
                payment.PaymentStatus = PaymentStatus.Failed;
                await _context.SaveChangesAsync();
            }

            // ✅ REDIRECT TO FRONTEND FAIL PAGE
            return Redirect("http://localhost:5173/payment/fail");
        }

        // ==========================================================
        // CANCEL SSL COMMERZ PAYMENT (REDIRECTS TO FRONTEND)
        // ==========================================================

        [AllowAnonymous]
        [HttpPost("cancel")]
        public async Task<IActionResult> Cancel([FromForm] string tran_id)
        {
            if (string.IsNullOrWhiteSpace(tran_id))
                return Redirect("http://localhost:5173/payment/cancel");

            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.TransactionId == tran_id);

            if (payment != null)
            {
                payment.PaymentStatus = PaymentStatus.Cancelled;
                await _context.SaveChangesAsync();
            }

            // ✅ REDIRECT TO FRONTEND CANCEL PAGE
            return Redirect("http://localhost:5173/payment/cancel");
        }

        // ==========================================================
        // IPN (Instant Payment Notification - Returns OK for SSLCommerz)
        // ==========================================================

        [AllowAnonymous]
        [HttpPost("ipn")]
        public async Task<IActionResult> IPN(
            [FromForm] string tran_id,
            [FromForm] string status,
            [FromForm] string? val_id)
        {
            if (string.IsNullOrWhiteSpace(tran_id))
                return BadRequest("Transaction ID is required.");

            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.TransactionId == tran_id);
            if (payment == null)
                return NotFound();

            if (status.Equals("VALID", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(val_id))
            {
                var validation = await _paymentService.GetPaymentValidationAsync(val_id);

                if (validation != null && validation.IsValid)
                {
                    if (!string.IsNullOrWhiteSpace(validation.TransactionId) &&
                        !string.Equals(validation.TransactionId, payment.TransactionId, StringComparison.OrdinalIgnoreCase))
                    {
                        payment.PaymentStatus = PaymentStatus.Failed;
                        await _context.SaveChangesAsync();
                        return BadRequest("Payment transaction verification failed.");
                    }

                    payment.PaymentStatus = PaymentStatus.Paid;
                    payment.BankTransactionId = validation.BankTransactionId;

                    var order = await _context.Orders.FindAsync(payment.OrderId);
                    if (order != null)
                    {
                        order.OrderStatus = OrderStatus.Accepted;
                    }
                }
                else
                {
                    payment.PaymentStatus = PaymentStatus.Failed;
                }
            }
            else
            {
                payment.PaymentStatus = PaymentStatus.Failed;
            }

            await _context.SaveChangesAsync();
            return Ok(); // SSLCommerz just needs a 200 OK response for IPN
        }

        // ==========================================================
        // CANCEL ORDER & REFUND CUSTOMER PAYMENT (KITCHEN LOCK ENFORCED)
        // ==========================================================

        [HttpPost("refund/{orderId}")]
        public async Task<IActionResult> Refund(int orderId, [FromBody] string? reason)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var order = await _context.Orders
                .Include(o => o.Payment)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == customerId);

            if (order == null)
                return NotFound("Order not found.");

            // 🛡️ KITCHEN LOCK POLICY (BACKEND ENFORCEMENT):
            if (order.OrderStatus != OrderStatus.Pending && order.OrderStatus != OrderStatus.Accepted)
            {
                return BadRequest("Cancellation is locked once the restaurant starts preparing your order.");
            }

            if (order.OrderStatus == OrderStatus.Cancelled)
                return BadRequest("This order is already cancelled.");

            var refundReason = string.IsNullOrWhiteSpace(reason) ? "Customer cancelled order." : reason;

            order.OrderStatus = OrderStatus.Cancelled;

            if (order.Payment != null)
            {
                if (order.Payment.PaymentMethod == PaymentMethod.CashOnDelivery)
                {
                    order.Payment.PaymentStatus = PaymentStatus.Cancelled;
                }
                else
                {
                    if (order.Payment.PaymentStatus == PaymentStatus.Paid)
                    {
                        var refundResult = await _paymentService.InitiateRefundAsync(order.Payment, refundReason);

                        if (!refundResult.Success)
                        {
                            return BadRequest(new { message = "Order cancelled, but automated refund failed. Contact support.", error = refundResult.ErrorReason });
                        }

                        order.Payment.RefundReferenceId = refundResult.RefundReferenceId;
                        order.Payment.RefundStatus = refundResult.Status;
                        order.Payment.RefundDate = DateTime.UtcNow;
                    }
                    else
                    {
                        order.Payment.PaymentStatus = PaymentStatus.Cancelled;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Order cancelled successfully.",
                orderId = order.Id,
                refundStatus = order.Payment?.RefundStatus ?? "N/A"
            });
        }

        // ==========================================================
        // CHECK REFUND STATUS
        // ==========================================================

        [HttpGet("refund-status/{refundReferenceId}")]
        public async Task<IActionResult> CheckRefundStatus(string refundReferenceId)
        {
            if (string.IsNullOrWhiteSpace(refundReferenceId))
                return BadRequest("Refund reference ID is required.");

            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();

            var payment = await _context.Payments.FirstOrDefaultAsync(p =>
                p.CustomerId == customerId && p.RefundReferenceId == refundReferenceId);

            if (payment == null)
                return NotFound("Refund record not found.");

            var refundResult = await _paymentService.CheckRefundStatusAsync(refundReferenceId);

            payment.RefundStatus = refundResult.Status;
            if (!string.IsNullOrWhiteSpace(refundResult.BankTransactionId))
            {
                payment.BankTransactionId = refundResult.BankTransactionId;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                refundReferenceId,
                status = refundResult.Status,
                success = refundResult.Success,
                bankTransactionId = refundResult.BankTransactionId,
                error = refundResult.ErrorReason
            });
        }

        // ==========================================================
        // PRIVATE METHOD
        // ==========================================================

        private static PaymentResponseDto CreateResponse(Payment payment)
        {
            return new PaymentResponseDto
            {
                PaymentId = payment.Id,
                OrderId = payment.OrderId,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod.ToString(),
                PaymentStatus = payment.PaymentStatus.ToString(),
                TransactionId = payment.TransactionId,
                PaymentDate = payment.PaymentDate
            };
        }
    }
}