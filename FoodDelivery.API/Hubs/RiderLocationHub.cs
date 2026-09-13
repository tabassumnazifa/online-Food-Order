using Microsoft.AspNetCore.SignalR;

namespace FoodDelivery.API.Hubs
{
    public class RiderLocationHub : Hub
    {
        /// <summary>
        /// Called by the Rider to send their current GPS coordinates.
        /// </summary>
        public async Task SendLocation(string orderId, double latitude, double longitude)
        {
            // Send the location ONLY to customers who are currently tracking this specific order
            await Clients.Group($"order_{orderId}")
                         .SendAsync("ReceiveLocation", latitude, longitude);
        }

        /// <summary>
        /// Called by the Customer when they open the tracking map.
        /// </summary>
        public async Task JoinOrderGroup(string orderId)
        {
            // Add the customer to a private "room" for this specific order
            await Groups.AddToGroupAsync(Context.ConnectionId, $"order_{orderId}");
        }
    }
}