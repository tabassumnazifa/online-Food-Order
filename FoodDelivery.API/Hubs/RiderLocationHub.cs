using Microsoft.AspNetCore.SignalR;

namespace FoodDelivery.API.Hubs
{
    public class RiderLocationHub : Hub
    {
        public async Task JoinOrderTracking(string orderId)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"order-{orderId}");
        }

        public async Task LeaveOrderTracking(string orderId)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"order-{orderId}");
        }
    }
}