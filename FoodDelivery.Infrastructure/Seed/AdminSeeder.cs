using FoodDelivery.Core.Enums;
using FoodDelivery.Core.Models;
using Microsoft.AspNetCore.Identity;

namespace FoodDelivery.Infrastructure.Seed
{
    public static class AdminSeeder
    {
        public static async Task SeedAdminAsync(
            UserManager<ApplicationUser> userManager)
        {
            const string adminEmail = "admin@fooddelivery.com";
            const string adminPassword = "Admin@12345";

            var existingAdmin =
                await userManager.FindByEmailAsync(adminEmail);

            if (existingAdmin != null)
            {
                return;
            }

            var admin = new ApplicationUser
            {
                FullName = "Super Admin",
                Email = adminEmail,
                UserName = adminEmail,
                EmailConfirmed = true
            };

            var result =
                await userManager.CreateAsync(
                    admin,
                    adminPassword
                );

            if (!result.Succeeded)
            {
                throw new Exception(
                    string.Join(
                        "; ",
                        result.Errors.Select(e => e.Description)
                    )
                );
            }

            await userManager.AddToRoleAsync(
                admin,
                Roles.Admin
            );
        }
    }
}