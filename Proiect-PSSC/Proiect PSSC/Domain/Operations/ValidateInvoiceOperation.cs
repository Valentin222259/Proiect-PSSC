// Validates UnvalidatedInvoice -> ValidatedInvoice or InvalidInvoice
//
// Dependencies:
// - Func<string, bool> orderExists: Checks if order exists
// - Func<string, bool> customerExists: Checks if customer exists
// - Func<string, bool> productExists: Checks if product exists
//
// Validation steps:
// 1. Parse and validate OrderId
// 2. Parse and validate CustomerId
// 3. Parse and validate BillingAddress
// 4. Validate each invoice item (productId, quantity, unitPrice)
// 5. Calculate and verify total amount matches sum of line totals
// 6. Return ValidatedInvoice or InvalidInvoice with errors

using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Models.Entities;
using Domain.Models.ValueObjects;

namespace Domain.Operations
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
                    errors.Add($"Order not found ({unvalidated.OrderId})");
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
                    errors.Add($"Customer not found ({unvalidated.CustomerId})");
            }

            // BillingAddress validation
            Address? parsedAddress = null;
            if (!Address.TryParse(unvalidated.BillingAddress, out var address))
            {
                errors.Add("Invalid billing address");
            }
            else
            {
                parsedAddress = address;
            }

            // Items validation
            var validatedItems = new List<InvoiceItem>();
            foreach (var raw in unvalidated.Items ?? Enumerable.Empty<UnvalidatedInvoiceItem>())
            {
                if (raw is null)
                {
                    errors.Add("Invalid invoice item (null)");
                    continue;
                }

                if (!ProductId.TryParse(raw.ProductId, out var productId))
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

                if (!Money.TryParse(raw.UnitPrice, out var unitPrice))
                {
                    errors.Add($"Invalid unit price for product ({raw.ProductId})");
                    continue;
                }

                var lineTotal = Money.Create(unitPrice.Amount * raw.Quantity, unitPrice.Currency);
                validatedItems.Add(new InvoiceItem(productId, raw.Quantity, unitPrice, lineTotal));
            }

            // Total amount validation
            Money? parsedTotalAmount = null;
            if (!Money.TryParse(unvalidated.TotalAmount, out var totalAmount))
            {
                errors.Add("Invalid total amount");
            }
            else
            {
                parsedTotalAmount = totalAmount;
            }

            // Verify total matches
            if (validatedItems.Any() && parsedTotalAmount != null)
            {
                var expectedAmount = validatedItems.Sum(i => i.LineTotal.Amount);
                if (parsedTotalAmount.Amount != expectedAmount)
                {
                    var expectedMoney = Money.Create(expectedAmount, parsedTotalAmount.Currency);
                    errors.Add($"Total amount mismatch: expected {expectedMoney}, got {parsedTotalAmount}");
                }
            }

            if (errors.Any())
                return new InvalidInvoice(errors);

            return new ValidatedInvoice(parsedOrderId!, parsedCustomerId!, validatedItems, parsedTotalAmount!, parsedAddress!);
        }
    }
}