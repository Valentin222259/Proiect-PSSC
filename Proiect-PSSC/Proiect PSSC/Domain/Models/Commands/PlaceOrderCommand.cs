using Domain.Models.Entities;

namespace Domain.Models.Commands
{
    // Comanda conține doar datele necesare pentru a iniția procesul (UnvalidatedOrder input)
    public record PlaceOrderCommand(UnvalidatedOrder InputOrder);
}