// Create ValidateOrderOperation following the pattern from copilot-instructions.md
//
// This operation transforms UnvalidatedOrder to either ValidatedOrder or InvalidOrder
//
// Dependencies:
// - Func<string, bool> customerExists (passed via constructor): Checks if customer exists in database
// - Func<string, bool> productExists (passed via constructor): Checks if product exists in inventory
//
// Business logic:
// - Create empty error list
// - Parse customerId to CustomerId using CustomerId.TryParse
// - If parsing fails, add error: "Invalid customer ID ({customerId})"
// - If parsing succeeds, check if customer exists using customerExists(customerId)
// - If not exists, add error: "Customer not found ({customerId})"
// - Parse deliveryAddress to Address using Address.TryParse
// - If parsing fails, add error: "Invalid delivery address"
// - Create list for validated OrderItems
// - For each item in unvalidated items:
//   - Parse productId to ProductId using ProductId.TryParse
//   - If parsing fails, add error: "Invalid product ID ({item.ProductId})"
//   - If parsing succeeds, check if product exists using productExists(productId)
//   - If not exists, add error: "Product not found ({item.ProductId})"
//   - Validate quantity > 0, if not add error: "Invalid quantity for product ({item.ProductId})"
//   - Create Money unitPrice (for now, use a mock value like new Money(10.0m, "USD") or get from dependency)
//   - Add new OrderItem(productId, quantity, unitPrice) to validated items list
// - Calculate totalAmount by summing all (item.Quantity * item.UnitPrice.Amount) and create Money with currency
// - If any errors exist, return new InvalidOrder(errors)
// - If no errors, return new ValidatedOrder(customerId, validatedItems, address, totalAmount)
//
// Override OnUnvalidated method
// Return either ValidatedOrder or InvalidOrder based on validation results
//
// Constructor signature:
// internal ValidateOrderOperation(Func<string, bool> customerExists, Func<string, bool> productExists)

using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Models.Entities;
using Domain.Models.ValueObjects;

namespace Domain.Operations
{
    internal sealed class ValidateOrderOperation : OrderOperation
    {
        private readonly Func<string, bool> customerExists;
        private readonly Func<string, bool> productExists;

        internal ValidateOrderOperation(Func<string, bool> customerExists, Func<string, bool> productExists)
        {
            this.customerExists = customerExists ?? throw new ArgumentNullException(nameof(customerExists));
            this.productExists = productExists ?? throw new ArgumentNullException(nameof(productExists));
        }

        protected override IOrder OnUnvalidated(UnvalidatedOrder unvalidated)
        {
            if (unvalidated is null) throw new ArgumentNullException(nameof(unvalidated));

            var errors = new List<string>();

            // CustomerId parsing & existence
            CustomerId? parsedCustomer = null;
            if (!CustomerId.TryParse(unvalidated.CustomerId, out var customerId))
            {
                errors.Add($"Invalid customer ID ({unvalidated.CustomerId})");
            }
            else
            {
                parsedCustomer = customerId;
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

            // Items validation and unit price (mocked)
            var validatedItems = new List<OrderItem>();
            foreach (var raw in unvalidated.Items ?? Enumerable.Empty<UnvalidatedOrderItem>())
            {
                if (raw is null)
                {
                    errors.Add("Invalid order item (null)");
                    continue;
                }

                var rawProductId = raw.ProductId ?? string.Empty;

                // ProductId parse
                if (!ProductId.TryParse(rawProductId, out var parsedProductId))
                {
                    errors.Add($"Invalid product ID ({rawProductId})");
                    continue;
                }

                // Product existence
                if (!productExists(rawProductId))
                {
                    errors.Add($"Product not found ({rawProductId})");
                }

                // Quantity validation
                if (raw.Quantity <= 0)
                {
                    errors.Add($"Invalid quantity for product ({rawProductId})");
                    continue;
                }

                // Unit price – mocked for now
                var unitPrice = Money.Create(10.00m, "USD");

                validatedItems.Add(new OrderItem(parsedProductId, raw.Quantity, unitPrice));
            }

            // If any errors, return InvalidOrder
            if (errors.Any())
                return new InvalidOrder(errors);

            // Calculate total
            decimal total = validatedItems.Sum(i => i.UnitPrice.Amount * i.Quantity);
            var totalMoney = Money.Create(total, "USD");

            // Return ValidatedOrder
            return new ValidatedOrder(parsedCustomer!, validatedItems, parsedAddress!, totalMoney);
        }
    }
}