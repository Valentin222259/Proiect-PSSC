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
        private readonly Func<string, decimal> getProductPrice;

        // ✅ Updated constructor to accept 3 parameters
        internal ValidateOrderOperation(
            Func<string, bool> customerExists,
            Func<string, bool> productExists,
            Func<string, decimal> getProductPrice)
        {
            this.customerExists = customerExists ?? throw new ArgumentNullException(nameof(customerExists));
            this.productExists = productExists ?? throw new ArgumentNullException(nameof(productExists));
            this.getProductPrice = getProductPrice ?? throw new ArgumentNullException(nameof(getProductPrice));
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

            // Items validation with REAL prices
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

                // ✅ Get REAL price from the dependency function
                decimal price;
                try
                {
                    price = getProductPrice(rawProductId);
                }
                catch (Exception ex)
                {
                    errors.Add($"Failed to get price for product ({rawProductId}): {ex.Message}");
                    continue;
                }

                var unitPrice = Money.Create(price, "USD");

                validatedItems.Add(new OrderItem(parsedProductId, raw.Quantity, unitPrice));
            }

            // If any errors, return InvalidOrder
            if (errors.Any())
                return new InvalidOrder(errors);

            // Calculate total with REAL prices
            decimal total = validatedItems.Sum(i => i.UnitPrice.Amount * i.Quantity);
            var totalMoney = Money.Create(total, "USD");

            // Return ValidatedOrder
            return new ValidatedOrder(parsedCustomer!, validatedItems, parsedAddress!, totalMoney);
        }
    }
}