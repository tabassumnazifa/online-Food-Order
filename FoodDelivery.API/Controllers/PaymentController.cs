using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Enums;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FoodDelivery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Customer)]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================
        // MAKE PAYMENT
        // =========================
        [HttpPost("pay")]
        public async Task<IActionResult> Pay(CreatePaymentDto model)
        {
            // Get logged-in customer ID
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            // Find the order
            var order = await _context.Orders.FindAsync(model.OrderId);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            // Verify that the order belongs to the logged-in customer
            if (order.CustomerId != customerId)
            {
                return Forbid();
            }

            // Check if payment already exists for this order
            var existingPayment = await _context.Payments
                .FirstOrDefaultAsync(p => p.OrderId == model.OrderId);

            if (existingPayment != null)
            {
                return BadRequest("This order has already been paid.");
            }

            // Create payment
            var payment = new Payment
            {
                OrderId = order.Id,
                CustomerId = customerId,
                Amount = order.TotalAmount,
                PaymentMethod = model.PaymentMethod,
                PaymentDate = DateTime.UtcNow
            };

            // Set payment status
            if (model.PaymentMethod == PaymentMethod.CashOnDelivery)
            {
                payment.PaymentStatus = PaymentStatus.Pending;
            }
            else
            {
                payment.PaymentStatus = PaymentStatus.Paid;

                // Simulated transaction ID
                payment.TransactionId = Guid.NewGuid()
                    .ToString("N")
                    .Substring(0, 12)
                    .ToUpper();
            }

            // Save payment
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Return response
            var response = new PaymentResponseDto
            {
                PaymentId = payment.Id,
                OrderId = payment.OrderId,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod.ToString(),
                PaymentStatus = payment.PaymentStatus.ToString(),
                TransactionId = payment.TransactionId,
                PaymentDate = payment.PaymentDate
            };

            return Ok(response);
        }

        // =========================
        // MY PAYMENT HISTORY
        // =========================
        [HttpGet("my-payments")]
        public async Task<IActionResult> GetMyPayments()
        {
            // Get logged-in customer ID
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            // Get all payments of this customer
            var payments = await _context.Payments
                .Where(p => p.CustomerId == customerId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new CustomerPaymentDto
                {
                    PaymentId = p.Id,
                    OrderId = p.OrderId,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod.ToString(),
                    PaymentStatus = p.PaymentStatus.ToString(),
                    PaymentDate = p.PaymentDate,
                    TransactionId = p.TransactionId
                })
                .ToListAsync();

            return Ok(payments);
        }

        // =========================
        // GET PAYMENT BY ID
        // =========================
        [HttpGet("{paymentId}")]
        public async Task<IActionResult> GetPaymentById(int paymentId)
        {
            // Get logged-in customer ID
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized();
            }

            // Find payment belonging to this customer
            var payment = await _context.Payments
                .Where(p => p.Id == paymentId &&
                            p.CustomerId == customerId)
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
            {
                return NotFound("Payment not found.");
            }

            return Ok(payment);
        }
    }
}