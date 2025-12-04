// Create SendInvoiceOperation following the pattern from copilot-instructions.md
//
// This operation transforms GeneratedInvoice to SentInvoice
//
// Dependencies:
// - Func<string, string, bool> sendInvoice (passed via constructor): Sends invoice via email/mail (invoiceId, recipientEmail) => success, returns true if sent successfully
// - Func<string, string> getCustomerEmail (passed via constructor): Gets customer email address by customerId
//
// Business logic:
// - Create empty error list
// - Get customer email using getCustomerEmail(invoice.CustomerId.ToString())
// - If email is null or empty, add error: "Customer email not found ({invoice.CustomerId})"
// - Set deliveryMethod to "Email"
// - Call sendInvoice(invoice.InvoiceId.ToString(), customerEmail)
// - If sendInvoice returns false, add error: "Failed to send invoice to ({customerEmail})"
// - Set sentAt to DateTime.UtcNow
// - If any errors exist, return new InvalidInvoice(errors)
// - Return new SentInvoice with all GeneratedInvoice properties + sentAt + customerEmail (as sentTo) + deliveryMethod
//
// Override OnGenerated method
// Return either SentInvoice or InvalidInvoice based on send results
//
// Constructor signature:
// internal SendInvoiceOperation(Func<string, string, bool> sendInvoice, Func<string, string> getCustomerEmail)

using System;
using System.Collections.Generic;
using Domain.Models.Entities;
using Domain.Operations.Base;

namespace Domain.Operations.Invoice
{
    internal sealed class SendInvoiceOperation : InvoiceOperation
    {
        private readonly Func<string, string, bool> sendInvoice;
        private readonly Func<string, string> getCustomerEmail;

        internal SendInvoiceOperation(Func<string, string, bool> sendInvoice, Func<string, string> getCustomerEmail)
        {
            this.sendInvoice = sendInvoice ?? throw new ArgumentNullException(nameof(sendInvoice));
            this.getCustomerEmail = getCustomerEmail ?? throw new ArgumentNullException(nameof(getCustomerEmail));
        }

        protected override IInvoice OnGenerated(GeneratedInvoice generated)
        {
            if (generated is null) throw new ArgumentNullException(nameof(generated));

            var errors = new List<string>();

            var customerIdStr = generated.CustomerId.ToString();
            string? customerEmail;
            try
            {
                customerEmail = getCustomerEmail(customerIdStr);
            }
            catch (Exception ex)
            {
                customerEmail = null;
                errors.Add($"Customer email not found ({generated.CustomerId}): {ex.Message}");
            }

            if (string.IsNullOrWhiteSpace(customerEmail))
            {
                errors.Add($"Customer email not found ({generated.CustomerId})");
            }

            var deliveryMethod = "Email";

            if (!string.IsNullOrWhiteSpace(customerEmail))
            {
                bool sent;
                try
                {
                    sent = sendInvoice(generated.InvoiceId.ToString(), customerEmail);
                }
                catch (Exception ex)
                {
                    sent = false;
                    errors.Add($"Failed to send invoice to ({customerEmail}): {ex.Message}");
                }

                if (!sent)
                {
                    errors.Add($"Failed to send invoice to ({customerEmail})");
                }
            }

            var sentAt = DateTime.UtcNow;

            if (errors.Count > 0)
                return new InvalidInvoice(errors);

            return new SentInvoice(generated, sentAt, customerEmail!, deliveryMethod);
        }
    }
}