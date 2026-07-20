using FoodDelivery.Core.Models;
using FoodDelivery.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PolicyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;


        public PolicyController(ApplicationDbContext context)
        {
            _context = context;
        }



        // ============================
        // GET PRIVACY POLICY
        // ============================

        [HttpGet("privacy")]
        public async Task<IActionResult> GetPrivacyPolicy()
        {
            var policy = await _context.Policies
                .FirstOrDefaultAsync(
                    x => x.Type == "PrivacyPolicy");


            if (policy == null)
                return NotFound("Privacy policy not found.");


            return Ok(policy);
        }




        // ============================
        // GET TERMS CONDITIONS
        // ============================

        [HttpGet("terms")]
        public async Task<IActionResult> GetTerms()
        {
            var policy = await _context.Policies
                .FirstOrDefaultAsync(
                    x => x.Type == "TermsConditions");


            if (policy == null)
                return NotFound("Terms and conditions not found.");


            return Ok(policy);
        }




        // ============================
        // ADMIN ADD POLICY
        // ============================

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreatePolicy(
            Policy policy)
        {
            policy.UpdatedAt = DateTime.UtcNow;


            await _context.Policies.AddAsync(policy);

            await _context.SaveChangesAsync();


            return Ok(new
            {
                message = "Policy created successfully."
            });
        }




        // ============================
        // ADMIN UPDATE POLICY
        // ============================

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePolicy(
            int id,
            Policy model)
        {
            var policy =
                await _context.Policies.FindAsync(id);


            if(policy == null)
                return NotFound();


            policy.Title = model.Title;
            policy.Content = model.Content;
            policy.Type = model.Type;
            policy.UpdatedAt = DateTime.UtcNow;


            await _context.SaveChangesAsync();


            return Ok(new
            {
                message = "Policy updated successfully."
            });
        }




        // ============================
        // ADMIN DELETE POLICY
        // ============================

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePolicy(
            int id)
        {
            var policy =
                await _context.Policies.FindAsync(id);


            if(policy == null)
                return NotFound();


            _context.Policies.Remove(policy);

            await _context.SaveChangesAsync();


            return Ok(new
            {
                message = "Policy deleted successfully."
            });
        }
    }
}