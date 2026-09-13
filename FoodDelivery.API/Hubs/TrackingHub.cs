using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace FoodDelivery.API.Hubs
{
    // Only logged-in users (Riders/Customers) can connect to this hub
    [Authorize] 
    public class TrackingHub : Hub
    {
        // The rider calls this to join a private "room" for a specific order
        public async Task JoinOrderGroup(int orderId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
        }

        // The rider calls this every few seconds with their new GPS coordinates
        public async Task UpdateRiderLocation(int orderId, double latitude, double longitude)
        {
            // Broadcast ONLY to the customer(s) watching this specific order group
            await Clients.Group($"Order_{orderId}").SendAsync("ReceiveRiderLocation", latitude, longitude);
        }
    }
}