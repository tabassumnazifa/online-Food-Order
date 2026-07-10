using FoodDelivery.Core.Enums;
using Microsoft.AspNetCore.Identity;

namespace FoodDelivery.Infrastructure.Seed
{
    public static class RoleSeeder
    {
        public static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles =
            {
                Roles.Admin,
                Roles.Customer,
                Roles.RestaurantOwner,
                Roles.DeliveryRider
            };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }
    }
}