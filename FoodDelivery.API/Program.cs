using System.Text;
using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
using FoodDelivery.Infrastructure.Seed;
using FoodDelivery.Infrastructure.Services;
using FoodDelivery.Infrastructure.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);


// ======================================================
// DATABASE
// ======================================================

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));



// ======================================================
// IDENTITY + SECURITY CONFIGURATION
// ======================================================

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password Security
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;


    // Account Lockout Protection
    options.Lockout.MaxFailedAccessAttempts = 5;

    options.Lockout.DefaultLockoutTimeSpan =
        TimeSpan.FromMinutes(5);

    options.Lockout.AllowedForNewUsers = true;


    // Require Email Verification Before Login
    options.SignIn.RequireConfirmedEmail = true;

})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();



// ======================================================
// EMAIL SETTINGS
// ======================================================

builder.Services.Configure<MailSettings>(
    builder.Configuration.GetSection("MailSettings"));


builder.Services.AddScoped<IEmailService, EmailService>();



// ======================================================
// JWT AUTHENTICATION
// ======================================================

var jwtSettings =
    builder.Configuration.GetSection("Jwt");


var key =
    Encoding.UTF8.GetBytes(
        jwtSettings["Key"]!);



builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;

})

.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,

            ValidateAudience = true,

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,


            ValidIssuer =
                jwtSettings["Issuer"],


            ValidAudience =
                jwtSettings["Audience"],


            IssuerSigningKey =
                new SymmetricSecurityKey(key)
        };
});



// ======================================================
// CONTROLLERS
// ======================================================

builder.Services.AddControllers();



// ======================================================
// SWAGGER + JWT
// ======================================================

builder.Services.AddEndpointsApiExplorer();


builder.Services.AddSwaggerGen(options =>
{

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",

            Description =
            "Enter JWT token as: Bearer {token}",

            In = ParameterLocation.Header,

            Type = SecuritySchemeType.Http,

            Scheme = "bearer",

            BearerFormat = "JWT"
        });



    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                    new OpenApiReference
                    {
                        Type =
                        ReferenceType.SecurityScheme,

                        Id = "Bearer"
                    }
                },

                Array.Empty<string>()
            }
        });
});



// ======================================================
// BUILD APPLICATION
// ======================================================

var app = builder.Build();



// ======================================================
// MIDDLEWARE
// ======================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI();
}



app.UseHttpsRedirection();


app.UseAuthentication();

app.UseAuthorization();



// ======================================================
// ROLE SEEDING
// ======================================================

using (var scope = app.Services.CreateScope())
{
    var roleManager =
        scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();


    await RoleSeeder.SeedRolesAsync(roleManager);
}



// ======================================================
// CONTROLLERS
// ======================================================

app.MapControllers();


app.Run();