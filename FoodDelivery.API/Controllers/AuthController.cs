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
            // Check whether email already exists
            var existingUser =
                await _userManager.FindByEmailAsync(model.Email);

            if (existingUser != null)
            {
                return BadRequest("Email is already registered.");
            }

            // Only these roles can be selected during registration.
            // Admin is NOT allowed to register from the frontend.
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
                EmailConfirmed = false
            };

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

            // =================================================
            // EMAIL VERIFICATION
            // =================================================

            var verificationToken =
                await _userManager.GenerateEmailConfirmationTokenAsync(user);

            var encodedToken =
                Uri.EscapeDataString(verificationToken);

            var verificationLink =
                $"http://localhost:5079/api/Auth/confirm-email" +
                $"?email={Uri.EscapeDataString(user.Email!)}" +
                $"&token={encodedToken}";

            var emailBody = $@"
<html>
<body>

<h2>Welcome to Food Delivery</h2>

<p>Hello {user.FullName},</p>

<p>
Thank you for creating your Food Delivery account.
</p>

<p>
Your selected account type is:
<strong>{model.Role}</strong>
</p>

<p>
Please verify your email address by clicking the button below.
</p>

<br/>

<a href='{verificationLink}'
   style='padding:10px 20px;
   background:#28a745;
   color:white;
   text-decoration:none;'>
   Verify Email
</a>

<br/><br/>

<p>
If you did not create this account, please ignore this email.
</p>

</body>
</html>
";

            await _emailService.SendEmailAsync(
                user.Email!,
                "Verify Your Food Delivery Account",
                emailBody
            );

            return Ok(new
            {
                message =
                    $"Registration successful as {model.Role}. Please verify your email."
            });
        }

        // =====================================================
        // LOGIN
        // =====================================================

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto model)
        {
            var user =
                await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
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

            // Check email verification
            if (!user.EmailConfirmed)
            {
                return Unauthorized(
                    "Please verify your email before logging in."
                );
            }

            // Get user's roles
            var roles =
                await _userManager.GetRolesAsync(user);

            if (roles == null || roles.Count == 0)
            {
                return Unauthorized(
                    "No role is assigned to this account."
                );
            }

            var jwtSettings =
                _configuration.GetSection("Jwt");

            var key =
                Encoding.UTF8.GetBytes(
                    jwtSettings["Key"]!
                );

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
                    user.Email!
                ),

                new Claim(
                    ClaimTypes.Name,
                    user.FullName
                )
            };

            // Add roles to JWT
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

            var token =
                new JwtSecurityToken(
                    issuer: jwtSettings["Issuer"],
                    audience: jwtSettings["Audience"],
                    claims: claims,
                    expires:
                        DateTime.Now.AddMinutes(
                            Convert.ToDouble(
                                jwtSettings["DurationInMinutes"]
                            )
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
        // CONFIRM EMAIL
        // =====================================================

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(
            string email,
            string token)
        {
            var user =
                await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return BadRequest("Invalid email.");
            }

            var decodedToken =
                Uri.UnescapeDataString(token);

            var result =
                await _userManager.ConfirmEmailAsync(
                    user,
                    decodedToken
                );

            if (!result.Succeeded)
            {
                return BadRequest(
                    "Email verification failed."
                );
            }

            return Ok(new
            {
                message =
                    "Email verified successfully. You can now login."
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