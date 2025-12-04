// Create ValidateShipmentOperation following the pattern from copilot-instructions.md
//
// This operation transforms UnvalidatedShipment to either ValidatedShipment or InvalidShipment
//
// Dependencies:
// - Func<string, bool> orderExists (passed via constructor): Checks if order exists and is ready for shipment
// - Func<string, bool> customerExists (passed via constructor): Checks if customer exists in database
// - Func<string, bool> productExists (passed via constructor): Checks if product exists in inventory
//
// Business logic:
// - Create empty error list
// - Parse orderId to OrderId using OrderId.TryParse
// - If parsing fails, add error: "Invalid order ID ({orderId})"
// - If parsing succeeds, check if order exists using orderExists(orderId)
// - If not exists, add error: "Order not found or not ready for shipment ({orderId})"
// - Parse customerId to CustomerId using CustomerId.TryParse
// - If parsing fails, add error: "Invalid customer ID ({customerId})"
// - If parsing succeeds, check if customer exists using customerExists(customerId)
// - If not exists, add error: "Customer not found ({customerId})"
// - Parse deliveryAddress to Address using Address.TryParse
// - If parsing fails, add error: "Invalid delivery address"
// - Create list for validated ShipmentItems
// - For each item in unvalidated items:
//   - Parse productId to ProductId using ProductId.TryParse
//   - If parsing fails, add error: "Invalid product ID ({item.ProductId})"
//   - If parsing succeeds, check if product exists using productExists(productId)
//   - If not exists, add error: "Product not found ({item.ProductId})"
//   - Validate quantity > 0, if not add error: "Invalid quantity for product ({item.ProductId})"
//   - Add new ShipmentItem(productId, quantity) to validated items list
// - If any errors exist, return new InvalidShipment(errors)
// - If no errors, return new ValidatedShipment(orderId, customerId, deliveryAddress, validatedItems)
//
// Override OnUnvalidated method
// Return either ValidatedShipment or InvalidShipment based on validation results
//
// Constructor signature:
// internal ValidateShipmentOperation(Func<string, bool> orderExists, Func<string, bool> customerExists, Func<string, bool> productExists)

using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Models.Entities;
using Domain.Models.ValueObjects;
using Domain.Operations.Base;

namespace Domain.Operations.Shipment
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

            // OrderId parsing & existence
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

            // CustomerId parsing & existence
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

            // Address parsing
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

                var rawProductId = raw.ProductId ?? string.Empty;

                if (!ProductId.TryParse(rawProductId, out var parsedProductId))
                {
                    errors.Add($"Invalid product ID ({rawProductId})");
                    continue;
                }

                if (!productExists(rawProductId))
                {
                    errors.Add($"Product not found ({rawProductId})");
                }

                if (raw.Quantity <= 0)
                {
                    errors.Add($"Invalid quantity for product ({rawProductId})");
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