// Validates UnvalidatedShipment -> ValidatedShipment or InvalidShipment
//
// Dependencies:
// - Func<string, bool> orderExists: Checks if order exists and is ready for shipment
// - Func<string, bool> customerExists: Checks if customer exists
// - Func<string, bool> productExists: Checks if product exists
//
// Validation steps:
// 1. Parse and validate OrderId
// 2. Parse and validate CustomerId
// 3. Parse and validate DeliveryAddress
// 4. Validate each shipment item (productId, quantity)
// 5. Return ValidatedShipment or InvalidShipment with errors

using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Models.Entities;
using Domain.Models.ValueObjects;

namespace Domain.Operations
{
    internal sealed class ValidateShipmentOperation : ShipmentOperation
    {
        private readonly Func<string, bool> orderExists;
        private readonly Func<string, bool> customerExists;
        private readonly Func<string, bool> productExists;

        internal ValidateShipmentOperation(
            Func<string, bool> orderExists,
            Func<string, bool> customerExists,
            Func<string, bool> productExists)
        {
            this.orderExists = orderExists ?? throw new ArgumentNullException(nameof(orderExists));
            this.customerExists = customerExists ?? throw new ArgumentNullException(nameof(customerExists));
            this.productExists = productExists ?? throw new ArgumentNullException(nameof(productExists));
        }

        protected override IShipment OnUnvalidated(UnvalidatedShipment unvalidated)
        {
            if (unvalidated is null) throw new ArgumentNullException(nameof(unvalidated));

            var errors = new List<string>();

            // OrderId validation
            OrderId? parsedOrderId = null;
            if (!OrderId.TryParse(unvalidated.OrderId, out var orderId))
            {
                errors.Add($"Invalid order ID ({unvalidated.OrderId})");
            }
            else
            {
                parsedOrderId = orderId;
                if (!orderExists(unvalidated.OrderId))
                {
                    errors.Add($"Order not found or not ready for shipment ({unvalidated.OrderId})");
                }
            }

            // CustomerId validation
            CustomerId? parsedCustomerId = null;
            if (!CustomerId.TryParse(unvalidated.CustomerId, out var customerId))
            {
                errors.Add($"Invalid customer ID ({unvalidated.CustomerId})");
            }
            else
            {
                parsedCustomerId = customerId;
                if (!customerExists(unvalidated.CustomerId))
                {
                    errors.Add($"Customer not found ({unvalidated.CustomerId})");
                }
            }

            // Address validation
            Address? parsedAddress = null;
            if (!Address.TryParse(unvalidated.DeliveryAddress, out var address))
            {
                errors.Add("Invalid delivery address");
            }
            else
            {
                parsedAddress = address;
            }

            // Items validation
            var validatedItems = new List<ShipmentItem>();
            foreach (var raw in unvalidated.Items ?? Enumerable.Empty<UnvalidatedShipmentItem>())
            {
                if (raw is null)
                {
                    errors.Add("Invalid shipment item (null)");
                    continue;
                }

                if (!ProductId.TryParse(raw.ProductId, out var parsedProductId))
                {
                    errors.Add($"Invalid product ID ({raw.ProductId})");
                    continue;
                }

                if (!productExists(raw.ProductId))
                {
                    errors.Add($"Product not found ({raw.ProductId})");
                }

                if (raw.Quantity <= 0)
                {
                    errors.Add($"Invalid quantity for product ({raw.ProductId})");
                    continue;
                }

                validatedItems.Add(new ShipmentItem(parsedProductId, raw.Quantity));
            }

            if (errors.Any())
                return new InvalidShipment(errors);

            return new ValidatedShipment(parsedOrderId!, parsedCustomerId!, validatedItems, parsedAddress!);
        }
    }
}