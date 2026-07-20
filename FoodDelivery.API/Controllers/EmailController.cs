using FoodDelivery.Core.DTOs;
using FoodDelivery.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace FoodDelivery.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public EmailController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] SendEmailDto dto)
        {
            await _emailService.SendEmailAsync(
                dto.ToEmail,
                dto.Subject,
                dto.Body,
                dto.IsHtml);

            return Ok(new
            {
                message = "Email sent successfully."
            });
        }
    }
}