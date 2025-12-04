// Create GenerateInvoiceOperation following the pattern from copilot-instructions.md
//
// This operation transforms ValidatedInvoice to GeneratedInvoice
//
// Dependencies:
// - Func<string> generateInvoiceId (passed via constructor): Generates unique invoice ID string
// - Func<string> generateInvoiceNumber (passed via constructor): Generates invoice number (e.g., "INV-2024-001")
//
// Business logic:
// - Create empty error list
// - Call generateInvoiceId() to get invoice ID string
// - Declare InvoiceId? invoiceId = null
// - Use InvoiceId.TryParse(generatedIdString, out invoiceId)
// - If TryParse returns false or invoiceId is null, add error: "Failed to generate invoice ID"
// - Call generateInvoiceNumber() to get invoice number string
// - If invoice number is null or empty, add error: "Failed to generate invoice number"
// - Set generatedAt to DateTime.UtcNow
// - If any errors exist, return new InvalidInvoice(errors)
// - Return new GeneratedInvoice with all ValidatedInvoice properties + invoiceId! (use null-forgiving operator) + generatedAt + invoiceNumber
//
// Note: At this point, if no errors exist, invoiceId is guaranteed to be non-null
//
// Override OnValidated method
// Return either GeneratedInvoice or InvalidInvoice based on generation results
//
// Constructor signature:
// internal GenerateInvoiceOperation(Func<string> generateInvoiceId, Func<string> generateInvoiceNumber)

using System;
using System.Collections.Generic;
using Domain.Models.Entities;
using Domain.Models.ValueObjects;
using Domain.Operations.Base;

namespace Domain.Operations.Invoice
{
    internal sealed class GenerateInvoiceOperation : InvoiceOperation
    {
        private readonly Func<string> generateInvoiceId;
        private readonly Func<string> generateInvoiceNumber;

        internal GenerateInvoiceOperation(Func<string> generateInvoiceId, Func<string> generateInvoiceNumber)
        {
            this.generateInvoiceId = generateInvoiceId ?? throw new ArgumentNullException(nameof(generateInvoiceId));
            this.generateInvoiceNumber = generateInvoiceNumber ?? throw new ArgumentNullException(nameof(generateInvoiceNumber));
        }

        protected override IInvoice OnValidated(ValidatedInvoice validated)
        {
            if (validated is null) throw new ArgumentNullException(nameof(validated));

            var errors = new List<string>();

            // Generate invoice id and try to parse
            string generatedId = generateInvoiceId();
            InvoiceId? invoiceId = null;
            if (!InvoiceId.TryParse(generatedId, out invoiceId) || invoiceId is null)
            {
                errors.Add("Failed to generate invoice ID");
            }

            // Generate invoice number
            string invoiceNumber = generateInvoiceNumber();
            if (string.IsNullOrWhiteSpace(invoiceNumber))
            {
                errors.Add("Failed to generate invoice number");
            }

            var generatedAt = DateTime.UtcNow;

            if (errors.Count > 0)
                return new InvalidInvoice(errors);

            // invoiceId is guaranteed non-null here
            return new GeneratedInvoice(validated, invoiceId!, generatedAt, invoiceNumber!);
        }
    }
}