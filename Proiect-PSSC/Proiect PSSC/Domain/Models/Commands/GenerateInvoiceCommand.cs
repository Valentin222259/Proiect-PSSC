using Domain.Models.Entities;

namespace Domain.Models.Commands
{
    // Command to generate an invoice from order data
    // Input: UnvalidatedInvoice
    // Used by: GenerateInvoiceWorkflow
    public record GenerateInvoiceCommand(UnvalidatedInvoice InputInvoice);
}