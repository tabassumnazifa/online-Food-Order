using Microsoft.AspNetCore.SignalR;

namespace FoodDelivery.API.Hubs
{
    public class TrackingHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}