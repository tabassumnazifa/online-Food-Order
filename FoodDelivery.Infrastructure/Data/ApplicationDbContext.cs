using FoodDelivery.Core.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }



        // =========================
        // DATABASE TABLES
        // =========================

        public DbSet<Restaurant> Restaurants { get; set; }

        public DbSet<Category> Categories { get; set; }

        public DbSet<Food> Foods { get; set; }

        public DbSet<Order> Orders { get; set; }

        public DbSet<OrderItem> OrderItems { get; set; }

        public DbSet<CartItem> CartItems { get; set; }

        public DbSet<Payment> Payments { get; set; }

        public DbSet<Feedback> Feedbacks { get; set; }

        public DbSet<Offer> Offers { get; set; }

        public DbSet<RiderLocation> RiderLocations { get; set; }


        // =========================
        // SECURITY / POLICY TABLE
        // =========================

        public DbSet<Policy> Policies { get; set; }



        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);



            // =========================
            // ORDER STATUS ENUM
            // STORE AS STRING
            // =========================

            builder.Entity<Order>()
                .Property(o => o.OrderStatus)
                .HasConversion<string>();

                builder.Entity<RiderLocation>()
    .HasOne(r => r.Rider)
    .WithMany()
    .HasForeignKey(r => r.RiderId)
    .OnDelete(DeleteBehavior.Cascade);



            // =========================
            // OFFER CONFIGURATION
            // =========================

            builder.Entity<Offer>()
                .Property(o => o.DiscountPercentage)
                .HasPrecision(5, 2);


            builder.Entity<Offer>()
                .Property(o => o.MaximumDiscount)
                .HasPrecision(10, 2);



            // =========================
            // OFFER -> RESTAURANT
            // =========================

            builder.Entity<Offer>()
                .HasOne(o => o.Restaurant)
                .WithMany(r => r.Offers)
                .HasForeignKey(o => o.RestaurantId)
                .OnDelete(DeleteBehavior.Restrict);



            // =========================
            // RESTAURANT -> OWNER
            // =========================

            builder.Entity<Restaurant>()
                .HasOne(r => r.Owner)
                .WithMany()
                .HasForeignKey(r => r.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);



            // =========================
            // FOOD -> RESTAURANT
            // =========================

            builder.Entity<Food>()
                .HasOne(f => f.Restaurant)
                .WithMany(r => r.Foods)
                .HasForeignKey(f => f.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);



            // =========================
            // FOOD -> CATEGORY
            // =========================

            builder.Entity<Food>()
                .HasOne(f => f.Category)
                .WithMany(c => c.Foods)
                .HasForeignKey(f => f.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

                // =========================



            // =========================
            // ORDER -> CUSTOMER
            // =========================

            builder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany()
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);



            // =========================
            // ORDER -> RIDER
            // =========================

            builder.Entity<Order>()
                .HasOne(o => o.Rider)
                .WithMany()
                .HasForeignKey(o => o.RiderId)
                .OnDelete(DeleteBehavior.Restrict);



            // =========================
            // ORDER -> RESTAURANT
            // =========================

            builder.Entity<Order>()
                .HasOne(o => o.Restaurant)
                .WithMany(r => r.Orders)
                .HasForeignKey(o => o.RestaurantId)
                .OnDelete(DeleteBehavior.Restrict);



            // =========================
            // ORDER ITEM -> ORDER
            // =========================

            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);



            // =========================
            // ORDER ITEM -> FOOD
            // =========================

            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Food)
                .WithMany(f => f.OrderItems)
                .HasForeignKey(oi => oi.FoodId)
                .OnDelete(DeleteBehavior.Restrict);



            // =========================
            // CART ITEM -> CUSTOMER
            // =========================

            builder.Entity<CartItem>()
                .HasOne(c => c.Customer)
                .WithMany()
                .HasForeignKey(c => c.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);



            // =========================
            // CART ITEM -> FOOD
            // =========================

            builder.Entity<CartItem>()
                .HasOne(c => c.Food)
                .WithMany()
                .HasForeignKey(c => c.FoodId)
                .OnDelete(DeleteBehavior.Cascade);



            // =========================
            // PAYMENT -> ORDER
            // ONE TO ONE
            // =========================

            builder.Entity<Payment>()
                .HasOne(p => p.Order)
                .WithOne(o => o.Payment)
                .HasForeignKey<Payment>(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);



            // =========================
            // PAYMENT DECIMAL
            // =========================

            builder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(10, 2);



            // =========================
            // FEEDBACK -> CUSTOMER
            // =========================

            builder.Entity<Feedback>()
                .HasOne(f => f.Customer)
                .WithMany()
                .HasForeignKey(f => f.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);



            // =========================
            // FEEDBACK -> RESTAURANT
            // =========================

            builder.Entity<Feedback>()
                .HasOne(f => f.Restaurant)
                .WithMany(r => r.Feedbacks)
                .HasForeignKey(f => f.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);



            // =========================
            // POLICY CONFIGURATION
            // =========================

            builder.Entity<Policy>()
                .Property(p => p.Title)
                .HasMaxLength(200);


            builder.Entity<Policy>()
                .Property(p => p.Type)
                .HasMaxLength(50);
        }
    }
}