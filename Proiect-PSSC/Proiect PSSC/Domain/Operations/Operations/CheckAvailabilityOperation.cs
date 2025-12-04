// Create CheckAvailabilityOperation following the pattern from copilot-instructions.md
//
// This operation checks stock availability for ValidatedOrder (doesn't change state, just validates)
//
// Dependencies:
// - Func<string, int> getAvailableStock (passed via constructor): Returns available stock quantity for a product
//
// Business logic:
// - Create empty error list
// - For each OrderItem in ValidatedOrder.Items:
//   - Get available stock using getAvailableStock(item.ProductId.ToString())
//   - If available stock < item.Quantity, add error: "Insufficient stock for product ({item.ProductId}): requested {item.Quantity}, available {availableStock}"
// - If any errors exist, return new InvalidOrder(errors)
// - If all items have sufficient stock, return the same ValidatedOrder (no state change)
//
// Override OnValidated method
// Return either ValidatedOrder (same instance if stock is available) or InvalidOrder
//
// Constructor signature:
// internal CheckAvailabilityOperation(Func<string, int> getAvailableStock)

using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Models.Entities;
using Domain.Operations.Base;

namespace Domain.Operations.Order
{
    internal sealed class CheckAvailabilityOperation : OrderOperation
    {
        private readonly Func<string, int> getAvailableStock;

        internal CheckAvailabilityOperation(Func<string, int> getAvailableStock)
        {
            this.getAvailableStock = getAvailableStock ?? throw new ArgumentNullException(nameof(getAvailableStock));
        }

        protected override IOrder OnValidated(ValidatedOrder validated)
        {
            if (validated is null) throw new ArgumentNullException(nameof(validated));

            var errors = new List<string>();

            foreach (var item in validated.Items ?? Array.Empty<OrderItem>())
            {
                if (item is null) continue;

                var productIdStr = item.ProductId.ToString();
                int available;
                try
                {
                    available = getAvailableStock(productIdStr);
                }
                catch (Exception ex)
                {
                    // If the availability check fails, treat as unavailable and report error
                    errors.Add($"Insufficient stock for product ({productIdStr}): requested {item.Quantity}, available 0 (error: {ex.Message})");
                    continue;
                }

                if (available < item.Quantity)
                {
                    errors.Add($"Insufficient stock for product ({productIdStr}): requested {item.Quantity}, available {available}");
                }
            }

            if (errors.Any())
                return new InvalidOrder(errors);

            return validated;
        }
    }
}