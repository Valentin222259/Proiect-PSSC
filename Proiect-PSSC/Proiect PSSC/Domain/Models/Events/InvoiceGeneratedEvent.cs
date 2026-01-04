using Domain.Models.Entities;
using System;
using System.Collections.Generic;

namespace Domain.Events
{
    public static class InvoiceGeneratedEvent
    {
        // Interface marker for invoice events
        public interface IInvoiceGeneratedEvent { }

        // Success event - contains the generated and sent invoice
        public record InvoiceGeneratedSucceededEvent : IInvoiceGeneratedEvent
        {
            public string InvoiceNumber { get; }
            public DateTime GeneratedAt { get; }
            public DateTime SentAt { get; }
            public SentInvoice Invoice { get; }
            public string Csv { get; } // For export/reporting

            internal InvoiceGeneratedSucceededEvent(SentInvoice invoice, DateTime generatedAt)
            {
                Invoice = invoice;
                GeneratedAt = generatedAt;
                SentAt = invoice.SentAt;
                InvoiceNumber = invoice.InvoiceNumber;
                Csv = $"{invoice.InvoiceId.Value},{invoice.OrderId.Value},{invoice.CustomerId.Value},{invoice.TotalAmount.Amount},{invoice.InvoiceNumber}";
            }
        }

        // Failure event - contains error reasons
        public record InvoiceGeneratedFailedEvent : IInvoiceGeneratedEvent
        {
            public IEnumerable<string> Reasons { get; }

            internal InvoiceGeneratedFailedEvent(IEnumerable<string> reasons)
            {
                Reasons = reasons;
            }
        }

        // Extension method to convert IInvoice state to Event
        public static IInvoiceGeneratedEvent ToEvent(this IInvoice invoice) => invoice switch
        {
            // If we reached SentInvoice state, invoice generation succeeded
            SentInvoice sentInvoice => new InvoiceGeneratedSucceededEvent(sentInvoice, sentInvoice.GeneratedAt),

            // If invalid, return failure event with reasons
            InvalidInvoice invalidInvoice => new InvoiceGeneratedFailedEvent(invalidInvoice.Reasons),

            // Any other intermediate state is unexpected at this point
            _ => new InvoiceGeneratedFailedEvent(new[] { $"Unexpected invoice state: {invoice.GetType().Name}" })
        };
    }
}