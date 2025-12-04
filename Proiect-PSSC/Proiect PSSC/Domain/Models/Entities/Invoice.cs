// Create entity states for Invoice following the pattern from copilot-instructions.md
// 
// IMPORTANT: Define IInvoice interface at namespace level (not nested in static class)
//
// State flow:
// UnvalidatedInvoice → ValidatedInvoice → GeneratedInvoice → SentInvoice
//                   ↘ InvalidInvoice
//
// States needed:
// 1. UnvalidatedInvoice: Raw input with string properties: orderId, customerId, items (productId, quantity, unitPrice), totalAmount, billingAddress
// 2. ValidatedInvoice: After validation with value objects: OrderId, CustomerId, IReadOnlyCollection<InvoiceItem>, Money totalAmount, Address billingAddress
// 3. GeneratedInvoice: After invoice generation: ValidatedInvoice properties + InvoiceId, DateTime generatedAt, string invoiceNumber
// 4. SentInvoice: Final state after sending: GeneratedInvoice properties + DateTime sentAt, string sentTo, string deliveryMethod
// 5. InvalidInvoice: When validation/processing fails, contains IEnumerable<string> Reasons
//
// Define these records:
// - UnvalidatedInvoiceItem(string productId, int quantity, string unitPrice) - for raw items
// - InvoiceItem(ProductId productId, int quantity, Money unitPrice, Money lineTotal) - for validated items
//
// Define interface at namespace level:
// public interface IInvoice { }
//
// Then define all state records implementing IInvoice:
// public record UnvalidatedInvoice(...) : IInvoice;
// public record ValidatedInvoice(...) : IInvoice;
// public record GeneratedInvoice(...) : IInvoice;
// public record SentInvoice(...) : IInvoice;
// public record InvalidInvoice(IEnumerable<string> Reasons) : IInvoice;
//
// Use IReadOnlyCollection for collections

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using Domain.Models.ValueObjects;

namespace Domain.Models.Entities
{
    // Interface at namespace level
    public interface IInvoice { }

    // Helper to create IReadOnlyCollection<T> from IEnumerable<T>
    internal static class InvoiceHelpers
    {
        internal static IReadOnlyCollection<T> ToReadOnly<T>(IEnumerable<T>? items)
        {
            if (items is IReadOnlyCollection<T> ric) return ric;
            var list = new List<T>(items ?? Array.Empty<T>());
            return new ReadOnlyCollection<T>(list);
        }
    }

    // Raw item in unvalidated state
    public record UnvalidatedInvoiceItem(string ProductId, int Quantity, string UnitPrice);

    // Validated invoice item
    public record InvoiceItem(ProductId ProductId, int Quantity, Money UnitPrice, Money LineTotal);

    // 1. UnvalidatedInvoice - raw input (strings)
    public record UnvalidatedInvoice(string OrderId, string CustomerId, IReadOnlyCollection<UnvalidatedInvoiceItem> Items, string TotalAmount, string BillingAddress) : IInvoice
    {
        public UnvalidatedInvoice(string orderId, string customerId, IEnumerable<UnvalidatedInvoiceItem>? items, string totalAmount, string billingAddress)
            : this(orderId, customerId, InvoiceHelpers.ToReadOnly(items), totalAmount, billingAddress)
        {
        }
    }

    // 2. ValidatedInvoice
    public record ValidatedInvoice(OrderId OrderId, CustomerId CustomerId, IReadOnlyCollection<InvoiceItem> Items, Money TotalAmount, Address BillingAddress) : IInvoice
    {
        internal ValidatedInvoice(OrderId orderId, CustomerId customerId, IEnumerable<InvoiceItem>? items, Money totalAmount, Address billingAddress)
            : this(orderId, customerId, InvoiceHelpers.ToReadOnly(items), totalAmount, billingAddress)
        {
        }
    }

    // 3. GeneratedInvoice
    public record GeneratedInvoice(OrderId OrderId, CustomerId CustomerId, IReadOnlyCollection<InvoiceItem> Items, Money TotalAmount, Address BillingAddress, InvoiceId InvoiceId, DateTime GeneratedAt, string InvoiceNumber) : IInvoice
    {
        internal GeneratedInvoice(ValidatedInvoice validated, InvoiceId invoiceId, DateTime generatedAt, string invoiceNumber)
            : this(validated.OrderId, validated.CustomerId, validated.Items, validated.TotalAmount, validated.BillingAddress, invoiceId, generatedAt, invoiceNumber ?? string.Empty)
        {
        }
    }

    // 4. SentInvoice
    public record SentInvoice(OrderId OrderId, CustomerId CustomerId, IReadOnlyCollection<InvoiceItem> Items, Money TotalAmount, Address BillingAddress, InvoiceId InvoiceId, DateTime GeneratedAt, string InvoiceNumber, DateTime SentAt, string SentTo, string DeliveryMethod) : IInvoice
    {
        internal SentInvoice(GeneratedInvoice generated, DateTime sentAt, string sentTo, string deliveryMethod)
            : this(generated.OrderId, generated.CustomerId, generated.Items, generated.TotalAmount, generated.BillingAddress, generated.InvoiceId, generated.GeneratedAt, generated.InvoiceNumber, sentAt, sentTo ?? string.Empty, deliveryMethod ?? string.Empty)
        {
        }
    }

    // 5. InvalidInvoice
    public record InvalidInvoice(IReadOnlyCollection<string> Reasons) : IInvoice
    {
        public InvalidInvoice(IEnumerable<string>? reasons) : this(InvoiceHelpers.ToReadOnly(reasons))
        {
        }
    }
}