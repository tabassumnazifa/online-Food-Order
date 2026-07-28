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

            if (!Enum.IsDefined(typeof(PaymentMethod),
                model.PaymentMethod))
            {
                return BadRequest(
                    "Invalid payment method.");
            }


            var customerId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);


            if (string.IsNullOrEmpty(customerId))
                return Unauthorized();



            var order =
                await _context.Orders
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o =>
                    o.Id == model.OrderId);



            if(order == null)
                return NotFound(
                    "Order not found.");



            if(order.CustomerId != customerId)
                return Forbid();



            var existingPayment =
                await _context.Payments
                .FirstOrDefaultAsync(p =>
                    p.OrderId == order.Id);



            if(existingPayment != null)
            {
                return BadRequest(
                    "Payment already exists.");
            }




            // ======================================================
            // CASH ON DELIVERY
            // ======================================================


            if(model.PaymentMethod ==
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
                    await _paymentService
                    .InitiatePaymentAsync(
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

            catch(Exception)
            {

                onlinePayment.PaymentStatus =
                    PaymentStatus.Failed;


                await _context.SaveChangesAsync();


                return BadRequest(
                    "Payment initialization failed.");
            }

        }






        // ==========================================================
        // CUSTOMER PAYMENT HISTORY
        // ==========================================================


        [HttpGet("my-payments")]
        public async Task<IActionResult> MyPayments()
        {

            var customerId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);



            if(string.IsNullOrEmpty(customerId))
                return Unauthorized();



            var payments =
                await _context.Payments
                .Where(p =>
                    p.CustomerId == customerId)

                .OrderByDescending(
                    p => p.PaymentDate)

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
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);



            var payment =
                await _context.Payments

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



            if(payment == null)
                return NotFound();



            return Ok(payment);
        }







        // ==========================================================
        // SSL SUCCESS
        // ==========================================================


        [AllowAnonymous]
        [HttpPost("success")]
        public async Task<IActionResult> Success(
            [FromForm] string tran_id,
            [FromForm] string? val_id)
        {


            var payment =
                await _context.Payments
                .FirstOrDefaultAsync(
                    p => p.TransactionId == tran_id);



            if(payment == null)
                return NotFound();



            var valid =
                await _paymentService
                .ValidatePaymentAsync(val_id);



            if(!valid)
            {
                return BadRequest(
                    "Payment validation failed.");
            }



            payment.PaymentStatus =
                PaymentStatus.Paid;



            payment.TransactionId =
                val_id;



            var order =
                await _context.Orders
                .FindAsync(payment.OrderId);



            if(order != null)
            {
                order.OrderStatus =
                    OrderStatus.Accepted;
            }



            await _context.SaveChangesAsync();



            return Ok(new
            {
                message =
                "Payment successful."
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

            var payment =
                await _context.Payments
                .FirstOrDefaultAsync(
                    p => p.TransactionId == tran_id);



            if(payment != null)
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
        // CANCEL
        // ==========================================================


        [AllowAnonymous]
        [HttpPost("cancel")]
        public async Task<IActionResult> Cancel(
            [FromForm] string tran_id)
        {

            var payment =
                await _context.Payments
                .FirstOrDefaultAsync(
                    p => p.TransactionId == tran_id);



            if(payment != null)
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


            var payment =
                await _context.Payments
                .FirstOrDefaultAsync(
                    p => p.TransactionId == tran_id);



            if(payment == null)
                return NotFound();



            if(status.Equals(
                "VALID",
                StringComparison.OrdinalIgnoreCase)
                &&
                await _paymentService
                .ValidatePaymentAsync(val_id))
            {

                payment.PaymentStatus =
                    PaymentStatus.Paid;


                payment.TransactionId =
                    val_id;



                var order =
                    await _context.Orders
                    .FindAsync(payment.OrderId);



                if(order != null)
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



            await _context.SaveChangesAsync();



            return Ok();

        }







        // ==========================================================
        // PRIVATE METHOD
        // ==========================================================


        private static PaymentResponseDto CreateResponse(
            Payment payment)
        {
            return new PaymentResponseDto
            {
                PaymentId = payment.Id,

                OrderId = payment.OrderId,

                Amount = payment.Amount,

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