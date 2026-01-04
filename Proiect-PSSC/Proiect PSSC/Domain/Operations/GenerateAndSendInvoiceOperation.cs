// Transforms ValidatedInvoice -> GeneratedInvoice -> SentInvoice
//
// Dependencies:
// - Func<string> generateInvoiceNumber: Generates unique invoice number
// - Func<string, string> getCustomerEmail: Gets customer email by customerId
//
// Steps:
// 1. Generate InvoiceId and invoice number
// 2. Create GeneratedInvoice with timestamp
// 3. Get customer email for sending
// 4. Create SentInvoice with sent timestamp and delivery method

using System;
using Domain.Models.Entities;
using Domain.Models.ValueObjects;

namespace Domain.Operations
{
    internal sealed class GenerateAndSendInvoiceOperation : InvoiceOperation
    {
        private readonly Func<string> generateInvoiceNumber;
        private readonly Func<string, string> getCustomerEmail;

        internal GenerateAndSendInvoiceOperation(
            Func<string> generateInvoiceNumber,
            Func<string, string> getCustomerEmail)
        {
            this.generateInvoiceNumber = generateInvoiceNumber ?? throw new ArgumentNullException(nameof(generateInvoiceNumber));
            this.getCustomerEmail = getCustomerEmail ?? throw new ArgumentNullException(nameof(getCustomerEmail));
        }

        protected override IInvoice OnValidated(ValidatedInvoice validated)
        {
            // Step 1: Generate invoice
            var invoiceIdString = $"INV-{Guid.NewGuid().ToString("N").Substring(0, 12).ToUpper()}";
            var invoiceId = InvoiceId.Parse(invoiceIdString);
            var invoiceNumber = generateInvoiceNumber();
            var generatedAt = DateTime.UtcNow;
            var generated = new GeneratedInvoice(validated, invoiceId, generatedAt, invoiceNumber);

            // Step 2: Send invoice
            var customerEmail = getCustomerEmail(validated.CustomerId.Value);
            var sentAt = DateTime.UtcNow;
            var deliveryMethod = "Email";

            return new SentInvoice(generated, sentAt, customerEmail, deliveryMethod);
        }
    }
}