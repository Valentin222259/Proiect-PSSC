// Create ValidateInvoiceOperation following the pattern from copilot-instructions.md
//
// This operation transforms UnvalidatedInvoice to either ValidatedInvoice or InvalidInvoice
//
// Dependencies:
// - Func<string, bool> orderExists (passed via constructor): Checks if order exists in database
// - Func<string, bool> customerExists (passed via constructor): Checks if customer exists in database
// - Func<string, bool> productExists (passed via constructor): Checks if product exists in inventory
//
// Business logic:
// - Create empty error list
// - Parse orderId to OrderId using OrderId.TryParse
// - If parsing fails, add error: "Invalid order ID ({orderId})"
// - If parsing succeeds, check if order exists using orderExists(orderId)
// - If not exists, add error: "Order not found ({orderId})"
// - Parse customerId to CustomerId using CustomerId.TryParse
// - If parsing fails, add error: "Invalid customer ID ({customerId})"
// - If parsing succeeds, check if customer exists using customerExists(customerId)
// - If not exists, add error: "Customer not found ({customerId})"
// - Parse billingAddress to Address using Address.TryParse
// - If parsing fails, add error: "Invalid billing address"
// - Create list for validated InvoiceItems
// - For each item in unvalidated items:
//   - Parse productId to ProductId using ProductId.TryParse
//   - If parsing fails, add error: "Invalid product ID ({item.ProductId})"
//   - If parsing succeeds, check if product exists using productExists(productId)
//   - If not exists, add error: "Product not found ({item.ProductId})"
//   - Validate quantity > 0, if not add error: "Invalid quantity for product ({item.ProductId})"
//   - Parse unitPrice string to Money using Money.TryParse
//   - If parsing fails, add error: "Invalid unit price for product ({item.ProductId})"
//   - Calculate lineTotal = new Money(quantity * unitPrice.Amount, unitPrice.Currency)
//   - Add new InvoiceItem(productId, quantity, unitPrice, lineTotal) to validated items list
// - Parse totalAmount string to Money using Money.TryParse
// - If parsing fails, add error: "Invalid total amount"
// - Calculate expected total by summing all lineTotal values
// - If totalAmount doesn't match expected total, add error: "Total amount mismatch: expected {expectedTotal}, got {totalAmount}"
// - If any errors exist, return new InvalidInvoice(errors)
// - If no errors, return new ValidatedInvoice(orderId, customerId, validatedItems, totalAmount, billingAddress)
//
// Override OnUnvalidated method
// Return either ValidatedInvoice or InvalidInvoice based on validation results
//
// Constructor signature:
// internal ValidateInvoiceOperation(Func<string, bool> orderExists, Func<string, bool> customerExists, Func<string, bool> productExists)

using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Models.Entities;
using Domain.Models.ValueObjects;
using Domain.Operations.Base;

namespace Domain.Operations.Invoice
{
    internal sealed class ValidateInvoiceOperation : InvoiceOperation
    {
        private readonly Func<string, bool> orderExists;
        private readonly Func<string, bool> customerExists;
        private readonly Func<string, bool> productExists;

        internal ValidateInvoiceOperation(
            Func<string, bool> orderExists,
            Func<string, bool> customerExists,
            Func<string, bool> productExists)
        {
            this.orderExists = orderExists ?? throw new ArgumentNullException(nameof(orderExists));
            this.customerExists = customerExists ?? throw new ArgumentNullException(nameof(customerExists));
            this.productExists = productExists ?? throw new ArgumentNullException(nameof(productExists));
        }

        protected override IInvoice OnUnvalidated(UnvalidatedInvoice unvalidated)
        {
            if (unvalidated is null) throw new ArgumentNullException(nameof(unvalidated));

            var errors = new List<string>();

            // OrderId parse & existence
            OrderId? parsedOrderId = null;
            if (!OrderId.TryParse(unvalidated.OrderId, out var orderId))
            {
                errors.Add($"Invalid order ID ({unvalidated.OrderId})");
            }
            else
            {
                parsedOrderId = orderId;
                if (!orderExists(unvalidated.OrderId))
                    errors.Add($"Order not found ({unvalidated.OrderId})");
            }

            // CustomerId parse & existence
            CustomerId? parsedCustomerId = null;
            if (!CustomerId.TryParse(unvalidated.CustomerId, out var customerId))
            {
                errors.Add($"Invalid customer ID ({unvalidated.CustomerId})");
            }
            else
            {
                parsedCustomerId = customerId;
                if (!customerExists(unvalidated.CustomerId))
                    errors.Add($"Customer not found ({unvalidated.CustomerId})");
            }

            // Billing address parse
            Address? parsedAddress = null;
            if (!Address.TryParse(unvalidated.BillingAddress, out var address))
            {
                errors.Add("Invalid billing address");
            }
            else
            {
                parsedAddress = address;
            }

            // Items
            var validatedItems = new List<InvoiceItem>();
            foreach (var raw in unvalidated.Items ?? Enumerable.Empty<UnvalidatedInvoiceItem>())
            {
                if (raw is null)
                {
                    errors.Add("Invalid invoice item (null)");
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

                // Unit price parsing
                if (!Money.TryParse(raw.UnitPrice, out var unitPrice))
                {
                    errors.Add($"Invalid unit price for product ({rawProductId})");
                    continue;
                }

                // Line total
                var lineTotal = Money.Create(unitPrice.Amount * raw.Quantity, unitPrice.Currency);

                validatedItems.Add(new InvoiceItem(parsedProductId, raw.Quantity, unitPrice, lineTotal));
            }

            // Total amount parsing
            Money? parsedTotalAmount = null;
            if (!Money.TryParse(unvalidated.TotalAmount, out var totalAmount))
            {
                errors.Add("Invalid total amount");
            }
            else
            {
                parsedTotalAmount = totalAmount;
            }

            // Expected total calculation and comparison (only if line items parsed)
            if (validatedItems.Any() && parsedTotalAmount != null)
            {
                var expectedAmount = validatedItems.Sum(i => i.LineTotal.Amount);
                // compare amounts directly (decimals). currency already validated on line totals.
                if (parsedTotalAmount.Amount != expectedAmount || !string.Equals(parsedTotalAmount.Currency, validatedItems.First().LineTotal.Currency, StringComparison.OrdinalIgnoreCase))
                {
                    var expectedMoney = Money.Create(expectedAmount, parsedTotalAmount.Currency);
                    errors.Add($"Total amount mismatch: expected {expectedMoney}, got {parsedTotalAmount}");
                }
            }

            if (errors.Any())
                return new InvalidInvoice(errors);

            // All good
            return new ValidatedInvoice(parsedOrderId!, parsedCustomerId!, validatedItems, parsedTotalAmount!, parsedAddress!);
        }
    }
}