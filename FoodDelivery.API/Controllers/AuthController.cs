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
        // CUSTOMER REGISTRATION
        // =====================================================

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            var existingUser = await _userManager.FindByEmailAsync(model.Email);

            if (existingUser != null)
                return BadRequest("Email is already registered.");


            var user = new ApplicationUser
            {
                FullName = model.FullName,
                Email = model.Email,
                UserName = model.Email,
                EmailConfirmed = false
            };


            var result = await _userManager.CreateAsync(
                user,
                model.Password);


            if (!result.Succeeded)
                return BadRequest(result.Errors);



            await _userManager.AddToRoleAsync(
                user,
                Roles.Customer);



            // ================================
            // EMAIL VERIFICATION
            // ================================

            var token =
                await _userManager.GenerateEmailConfirmationTokenAsync(user);


            var encodedToken =
                Uri.EscapeDataString(token);


            var verificationLink =
                $"http://localhost:5079/api/Auth/confirm-email?email={user.Email}&token={encodedToken}";



            var emailBody = $@"
            <html>
            <body>

            <h2>Welcome to Food Delivery</h2>

            <p>Hello {user.FullName},</p>

            <p>
            Thank you for creating an account.
            Please verify your email address.
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
            If you did not create this account,
            ignore this email.
            </p>

            </body>
            </html>";



            await _emailService.SendEmailAsync(
                user.Email,
                "Verify Your Food Delivery Account",
                emailBody);



            return Ok(new
            {
                message =
                "Registration successful. Please verify your email."
            });
        }




        // =====================================================
        // RESTAURANT OWNER REGISTRATION
        // =====================================================
        // =====================================================
// FORGOT PASSWORD
// =====================================================

[HttpPost("forgot-password")]
public async Task<IActionResult> ForgotPassword(
    ForgotPasswordDto model)
{
    var user = await _userManager.FindByEmailAsync(model.Email);


    if (user == null)
    {
        return BadRequest("Email not found.");
    }


    var token =
        await _userManager.GeneratePasswordResetTokenAsync(user);


    var encodedToken =
        Uri.EscapeDataString(token);


    var resetLink =
        $"http://localhost:5079/api/Auth/reset-password?email={user.Email}&token={encodedToken}";



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
    If you did not request this, ignore this email.
    </p>

    </body>
    </html>";



    await _emailService.SendEmailAsync(
        user.Email!,
        "Food Delivery Password Reset",
        emailBody);



    return Ok(new
    {
        message = "Password reset link sent successfully."
    });
}

        [HttpPost("register-restaurant-owner")]
        public async Task<IActionResult> RegisterRestaurantOwner(RegisterDto model)
        {
            var existingUser =
                await _userManager.FindByEmailAsync(model.Email);


            if (existingUser != null)
                return BadRequest("Email is already registered.");



            var user = new ApplicationUser
            {
                FullName = model.FullName,
                Email = model.Email,
                UserName = model.Email,
                EmailConfirmed = false
            };


            var result =
                await _userManager.CreateAsync(
                    user,
                    model.Password);



            if (!result.Succeeded)
                return BadRequest(result.Errors);



            await _userManager.AddToRoleAsync(
                user,
                Roles.RestaurantOwner);



            return Ok(
                "Restaurant owner registered successfully.");
        }




        // =====================================================
        // RIDER REGISTRATION
        // =====================================================

        [HttpPost("register-rider")]
        public async Task<IActionResult> RegisterDeliveryRider(RegisterDto model)
        {
            var existingUser =
                await _userManager.FindByEmailAsync(model.Email);



            if (existingUser != null)
                return BadRequest("Email is already registered.");



            var user = new ApplicationUser
            {
                FullName = model.FullName,
                Email = model.Email,
                UserName = model.Email,
                EmailConfirmed = false
            };



            var result =
                await _userManager.CreateAsync(
                    user,
                    model.Password);



            if (!result.Succeeded)
                return BadRequest(result.Errors);



            await _userManager.AddToRoleAsync(
                user,
                Roles.DeliveryRider);



            return Ok(
                "Delivery rider registered successfully.");
        }
        // =====================================================
// CONFIRM EMAIL
// =====================================================

[HttpGet("confirm-email")]
public async Task<IActionResult> ConfirmEmail(
    string email,
    string token)
{
    var user = await _userManager.FindByEmailAsync(email);

    if (user == null)
    {
        return BadRequest("Invalid email.");
    }


    var decodedToken = Uri.UnescapeDataString(token);


    var result = await _userManager.ConfirmEmailAsync(
        user,
        decodedToken);


    if (!result.Succeeded)
    {
        return BadRequest("Email verification failed.");
    }


    return Ok(new
    {
        message = "Email verified successfully. You can now login."
    });
}


// =====================================================
// RESET PASSWORD
// =====================================================

[HttpPost("reset-password")]
public async Task<IActionResult> ResetPassword(
    ResetPasswordDto model)
{
    var user = await _userManager.FindByEmailAsync(model.Email);


    if (user == null)
    {
        return BadRequest("Invalid email.");
    }


    var decodedToken =
        Uri.UnescapeDataString(model.Token);



    var result =
        await _userManager.ResetPasswordAsync(
            user,
            decodedToken,
            model.NewPassword);



    if (!result.Succeeded)
    {
        return BadRequest(result.Errors);
    }



    return Ok(new
    {
        message = "Password reset successfully. You can login now."
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
                return Unauthorized("Invalid email or password.");



            var passwordValid =
                await _userManager.CheckPasswordAsync(
                    user,
                    model.Password);



            if (!passwordValid)
                return Unauthorized("Invalid email or password.");



            var jwtSettings =
                _configuration.GetSection("Jwt");


            var key =
                Encoding.UTF8.GetBytes(
                    jwtSettings["Key"]!);



            var roles =
                await _userManager.GetRolesAsync(user);



            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id),

                new Claim(
                    ClaimTypes.Email,
                    user.Email!)
            };



            foreach(var role in roles)
            {
                claims.Add(
                    new Claim(
                        ClaimTypes.Role,
                        role));
            }



            var token =
                new JwtSecurityToken(
                    issuer: jwtSettings["Issuer"],
                    audience: jwtSettings["Audience"],
                    claims: claims,
                    expires:
                    DateTime.Now.AddMinutes(
                        Convert.ToDouble(
                            jwtSettings["DurationInMinutes"])),

                    signingCredentials:
                    new SigningCredentials(
                        new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256)
                );



            return Ok(new
            {
                token =
                new JwtSecurityTokenHandler()
                .WriteToken(token)
            });
        }
    }
}