using FoodDelivery.Core.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
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

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

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
                .WithMany()
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
                .WithMany()
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
            // =========================
            builder.Entity<Payment>()
                .HasOne(p => p.Order)
                .WithMany()
                .HasForeignKey(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

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
                .WithMany()
                .HasForeignKey(f => f.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}