using System.Text;
using System.Threading.Tasks;
using FoodDelivery.API.Hubs;
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
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// ======================================================
// IDENTITY
// ======================================================
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;

    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.AllowedForNewUsers = true;

    options.SignIn.RequireConfirmedEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// ======================================================
// EMAIL
// ======================================================
builder.Services.Configure<MailSettings>(builder.Configuration.GetSection("MailSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();

// ======================================================
// SSL COMMERZ
// ======================================================
builder.Services.Configure<SSLCommerzSettings>(builder.Configuration.GetSection("SSLCommerz"));
builder.Services.AddHttpClient<IPaymentService, PaymentService>();

// ======================================================
// SIGNALR
// ======================================================
builder.Services.AddSignalR();

// ======================================================
// JWT AUTHENTICATION
// ======================================================
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// ======================================================
// CONTROLLERS & CORS
// ======================================================
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); 
    });
});

// ======================================================
// SWAGGER
// ======================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT token as: Bearer {token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
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

// ✅ CRITICAL: Serves files from the wwwroot folder (e.g., wwwroot/uploads)
app.UseStaticFiles(); 

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();

// ======================================================
// DATABASE SEEDING
// ======================================================
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

    await RoleSeeder.SeedRolesAsync(roleManager);
    await AdminSeeder.SeedAdminAsync(userManager);
}

// ======================================================
// ENDPOINTS
// ======================================================
app.MapControllers();
app.MapHub<TrackingHub>("/hubs/tracking");

app.Run();