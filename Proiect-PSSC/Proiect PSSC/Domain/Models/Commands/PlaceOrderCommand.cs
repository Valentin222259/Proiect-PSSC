using Domain.Models.Entities;

namespace Domain.Models.Commands
{
    public record PlaceOrderCommand(UnvalidatedOrder InputOrder);
}