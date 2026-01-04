using Domain.Models.Commands;
using Domain.Models.Entities;
using Domain.Operations;
using Domain.Events;
using static Domain.Events.OrderPlacedEvent;
using System;

namespace Domain.Workflows
{
    public class PlaceOrderWorkflow
    {
        // Execute method receives the command and dependencies
        public IOrderPlacedEvent Execute(
            PlaceOrderCommand command,
            Func<string, bool> checkCustomerExists,
            Func<string, bool> checkProductExists,
            Func<string, int> getAvailableStock,      
            Func<string, int, string> reserveStock  
            )
        {
            // 1. Start with Unvalidated state (from command)
            IOrder order = command.InputOrder;

            // 2. Validation (Unvalidated -> Validated or Invalid)
            order = new ValidateOrderOperation(checkCustomerExists, checkProductExists)
                .Transform(order);

            // 3. Check Availability & Reserve Stock (Validated -> StockReserved or Invalid)
            order = new ReserveStockOperation(getAvailableStock, reserveStock)
                .Transform(order);

            // 4. Convert to Event (Final State -> Event)
            return order.ToEvent();
        }
    }
}