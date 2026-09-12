
using FoodDelivery.Core.DTOs;
using FoodDelivery.Core.Enums;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FoodDelivery.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _userManager = userManager;
            _configuration = configuration;
            _emailService = emailService;
        }

        // =====================================================
        // REGISTER
        // =====================================================

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            // Check if email already exists
            var existingUser =
                await _userManager.FindByEmailAsync(model.Email);

            if (existingUser != null)
            {
                return BadRequest("Email is already registered.");
            }

            // Allowed registration roles
            var allowedRoles = new[]
            {
                Roles.Customer,
                Roles.RestaurantOwner,
                Roles.DeliveryRider
            };

            if (!allowedRoles.Contains(model.Role))
            {
                return BadRequest("Invalid role selected.");
            }

            // Create user
            var user = new ApplicationUser
            {
                FullName = model.FullName,
                Email = model.Email,
                UserName = model.Email,

                // Email verification is not required anymore
                EmailConfirmed = true,

                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            // Create account with Identity password hashing
            var result = await _userManager.CreateAsync(
                user,
                model.Password
            );

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            // Assign selected role
            var roleResult = await _userManager.AddToRoleAsync(
                user,
                model.Role
            );

            if (!roleResult.Succeeded)
            {
                // Remove user if role assignment fails
                await _userManager.DeleteAsync(user);

                return BadRequest(roleResult.Errors);
            }

            // Registration completed
            return Ok(new
            {
                message = $"Registration successful as {model.Role}."
            });
        }


        // =====================================================
        // LOGIN
        // =====================================================

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto model)
        {
            // Find user by email
            var user =
                await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            // Check account status
            if (!user.IsActive)
            {
                return Unauthorized(
                    "Your account has been blocked by the administrator."
                );
            }

            // Check password
            var passwordValid =
                await _userManager.CheckPasswordAsync(
                    user,
                    model.Password
                );

            if (!passwordValid)
            {
                return Unauthorized("Invalid email or password.");
            }

            // Get user roles
            var roles =
                await _userManager.GetRolesAsync(user);

            if (roles == null || roles.Count == 0)
            {
                return Unauthorized(
                    "No role is assigned to this account."
                );
            }

            // =================================================
            // JWT SETTINGS
            // =================================================

            var jwtSettings =
                _configuration.GetSection("Jwt");

            var jwtKey = jwtSettings["Key"];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    "JWT configuration is missing."
                );
            }

            var key =
                Encoding.UTF8.GetBytes(jwtKey);

            // =================================================
            // JWT CLAIMS
            // =================================================

            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id
                ),

                new Claim(
                    ClaimTypes.Email,
                    user.Email ?? string.Empty
                ),

                new Claim(
                    ClaimTypes.Name,
                    user.FullName
                )
            };

            foreach (var role in roles)
            {
                claims.Add(
                    new Claim(
                        ClaimTypes.Role,
                        role
                    )
                );
            }

            // =================================================
            // CREATE JWT
            // =================================================

            var durationSetting =
                jwtSettings["DurationInMinutes"];

            if (!double.TryParse(
                    durationSetting,
                    out var durationInMinutes))
            {
                durationInMinutes = 60;
            }

            var token =
                new JwtSecurityToken(
                    issuer: jwtSettings["Issuer"],
                    audience: jwtSettings["Audience"],
                    claims: claims,
                    expires:
                        DateTime.Now.AddMinutes(
                            durationInMinutes
                        ),
                    signingCredentials:
                        new SigningCredentials(
                            new SymmetricSecurityKey(key),
                            SecurityAlgorithms.HmacSha256
                        )
                );

            var tokenString =
                new JwtSecurityTokenHandler()
                    .WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                role = roles.FirstOrDefault()
            });
        }


        // =====================================================
        // FORGOT PASSWORD
        // =====================================================

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(
            ForgotPasswordDto model)
        {
            var user =
                await _userManager.FindByEmailAsync(
                    model.Email
                );

            if (user == null)
            {
                return BadRequest("Email not found.");
            }

            if (!user.IsActive)
            {
                return BadRequest(
                    "This account has been blocked by the administrator."
                );
            }

            var resetToken =
                await _userManager.GeneratePasswordResetTokenAsync(
                    user
                );

            var encodedToken =
                Uri.EscapeDataString(resetToken);

            var resetLink =
                $"http://localhost:5079/api/Auth/reset-password" +
                $"?email={Uri.EscapeDataString(user.Email!)}" +
                $"&token={encodedToken}";

            var emailBody = $@"
<html>
<body>

<h2>Password Reset Request</h2>

<p>Hello {user.FullName},</p>

<p>
We received a request to reset your Food Delivery account password.
</p>

<p>
Click the button below to reset your password:
</p>

<br/>

<a href='{resetLink}'
   style='padding:10px 20px;
   background:#dc3545;
   color:white;
   text-decoration:none;'>
   Reset Password
</a>

<br/><br/>

<p>
If you did not request this, please ignore this email.
</p>

</body>
</html>
";

            await _emailService.SendEmailAsync(
                user.Email!,
                "Food Delivery Password Reset",
                emailBody
            );

            return Ok(new
            {
                message =
                    "Password reset link sent successfully."
            });
        }


        // =====================================================
        // RESET PASSWORD
        // =====================================================

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(
            ResetPasswordDto model)
        {
            var user =
                await _userManager.FindByEmailAsync(
                    model.Email
                );

            if (user == null)
            {
                return BadRequest("Invalid email.");
            }

            if (!user.IsActive)
            {
                return BadRequest(
                    "This account has been blocked by the administrator."
                );
            }

            var decodedToken =
                Uri.UnescapeDataString(
                    model.Token
                );

            var result =
                await _userManager.ResetPasswordAsync(
                    user,
                    decodedToken,
                    model.NewPassword
                );

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new
            {
                message =
                    "Password reset successfully. You can login now."
            });
        }
    }
}
