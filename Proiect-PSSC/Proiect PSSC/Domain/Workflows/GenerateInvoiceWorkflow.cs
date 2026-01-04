using Domain.Models.Commands;
using Domain.Models.Entities;
using Domain.Operations;
using static Domain.Events.InvoiceGeneratedEvent;
using System;

namespace Domain.Workflows
{
    public class GenerateInvoiceWorkflow
    {
        // Execute method receives the command and dependencies
        public IInvoiceGeneratedEvent Execute(
            GenerateInvoiceCommand command,
            Func<string, bool> checkOrderExists,
            Func<string, bool> checkCustomerExists,
            Func<string, bool> checkProductExists,
            Func<string> generateInvoiceNumber,
            Func<string, string> getCustomerEmail
        )
        {
            // 1. Start with UnvalidatedInvoice (from command)
            IInvoice invoice = command.InputInvoice;

            // 2. Validate (Unvalidated -> Validated or Invalid)
            invoice = new ValidateInvoiceOperation(checkOrderExists, checkCustomerExists, checkProductExists)
                .Transform(invoice);

            // 3. Generate and Send Invoice (Validated -> Generated -> Sent)
            invoice = new GenerateAndSendInvoiceOperation(generateInvoiceNumber, getCustomerEmail)
                .Transform(invoice);

            // 4. Convert to Event
            return invoice.ToEvent();
        }
    }
}