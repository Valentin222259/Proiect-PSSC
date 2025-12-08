using Domain.Models.Commands;
using Domain.Models.Entities;
using Domain.Operations.Order; // Asigură-te că namespace-ul corespunde cu operațiile tale
using Domain.Events;
using static Domain.Events.OrderPlacedEvent; // Pentru acces la ToEvent
using System;
using Microsoft.Extensions.Logging; // Opțional, pentru logging

namespace Domain.Workflows
{
    public class PlaceOrderWorkflow
    {
        // Metoda Execute primește Comanda și Funcțiile (dependențele) necesare operațiilor
        public IOrderPlacedEvent Execute(
            PlaceOrderCommand command,
            Func<string, bool> checkCustomerExists,
            Func<string, bool> checkProductExists,
            Func<string, int> getAvailableStock,
            Func<string, int, string> reserveStock
            )
        {
            // 1. Pornim de la starea Unvalidated (din comandă)
            IOrder order = command.InputOrder;

            // 2. Validare (Unvalidated -> Validated sau Invalid)
            // Folosim operația pe care ai scris-o tu: ValidateOrderOperation
            order = new ValidateOrderOperation(checkCustomerExists, checkProductExists)
                .Transform(order);

            // 3. Verificare Stoc (Validated -> Validated sau Invalid)
            // Folosim operația: CheckAvailabilityOperation
            // Notă: Această operație primește IOrder, dar intern face cast la ValidatedOrder. 
            // Dacă pasul 2 a returnat InvalidOrder, operațiile tale trebuie să gestioneze asta (prin pattern matching în clasa de bază OrderOperation).
            order = new CheckAvailabilityOperation(getAvailableStock)
                .Transform(order);

            // 4. Rezervare Stoc (Validated -> StockReserved sau Invalid)
            // Folosim operația: ReserveStockOperation
            order = new ReserveStockOperation(reserveStock)
                .Transform(order);

            // 5. Conversie la Eveniment (Final State -> Event)
            return order.ToEvent();
        }
    }
}