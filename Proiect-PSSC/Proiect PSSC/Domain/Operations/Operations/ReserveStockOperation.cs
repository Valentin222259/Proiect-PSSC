// Create ReserveStockOperation following the pattern from copilot-instructions.md
//
// This operation transforms ValidatedOrder to StockReservedOrder
//
// Dependencies:
// - Func<string, int, string> reserveStock (passed via constructor): Reserves stock and returns reservationId (productId, quantity) => reservationId
//
// Business logic:
// - Create empty error list
// - Create list to collect reservation IDs
// - For each OrderItem in ValidatedOrder.Items:
//   - Call reserveStock(item.ProductId.ToString(), item.Quantity)
//   - If reservation fails (returns null or empty string), add error: "Failed to reserve stock for product ({item.ProductId})"
//   - If succeeds, add returned reservationId to list
// - If any errors exist, return new InvalidOrder(errors)
// - Combine all reservation IDs into single string: string.Join(",", reservationIds)
// - Set reservedAt to DateTime.UtcNow
// - Return new StockReservedOrder with all ValidatedOrder properties + combined reservationId + reservedAt
//
// Override OnValidated method
// Return either StockReservedOrder or InvalidOrder based on reservation results
//
// Constructor signature:
// internal ReserveStockOperation(Func<string, int, string> reserveStock)

using System;
using System.Collections.Generic;
using Domain.Models.Entities;
using Domain.Operations.Base;

namespace Domain.Operations.Order
{
    internal sealed class ReserveStockOperation : OrderOperation
    {
        private readonly Func<string, int, string> reserveStock;

        internal ReserveStockOperation(Func<string, int, string> reserveStock)
        {
            this.reserveStock = reserveStock ?? throw new ArgumentNullException(nameof(reserveStock));
        }

        protected override IOrder OnValidated(ValidatedOrder validated)
        {
            if (validated is null) throw new ArgumentNullException(nameof(validated));

            var errors = new List<string>();
            var reservationIds = new List<string>();

            foreach (var item in validated.Items ?? Array.Empty<OrderItem>())
            {
                if (item is null)
                {
                    errors.Add("Invalid order item (null)");
                    continue;
                }

                string productIdStr = item.ProductId.ToString();
                string reservationId;
                try
                {
                    reservationId = reserveStock(productIdStr, item.Quantity);
                }
                catch (Exception ex)
                {
                    errors.Add($"Failed to reserve stock for product ({productIdStr}): {ex.Message}");
                    continue;
                }

                if (string.IsNullOrWhiteSpace(reservationId))
                {
                    errors.Add($"Failed to reserve stock for product ({productIdStr})");
                    continue;
                }

                reservationIds.Add(reservationId);
            }

            if (errors.Count > 0)
                return new InvalidOrder(errors);

            var combinedReservationId = string.Join(",", reservationIds);
            var reservedAt = DateTime.UtcNow;

            return new StockReservedOrder(validated, combinedReservationId, reservedAt);
        }
    }
}