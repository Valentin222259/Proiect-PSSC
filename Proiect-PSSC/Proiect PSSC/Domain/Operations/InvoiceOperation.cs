// Invoice operation base class following the pattern from copilot-instructions.md
//
// This is the abstract base class for all Invoice operations
// Inherits from: DomainOperation<IInvoice, object, IInvoice>
//
// Pattern matching for invoice states:
// - UnvalidatedInvoice -> OnUnvalidated
// - ValidatedInvoice -> OnValidated
// - GeneratedInvoice -> OnGenerated
// - SentInvoice -> OnSent
// - InvalidInvoice -> OnInvalid

using System;
using Domain.Models.Entities;

namespace Domain.Operations
{
    internal abstract class InvoiceOperation : DomainOperation<IInvoice, object, IInvoice>
    {
        internal IInvoice Transform(IInvoice entity) => Transform(entity, null);

        public override IInvoice Transform(IInvoice entity, object? state) => entity switch
        {
            UnvalidatedInvoice unvalidated => OnUnvalidated(unvalidated),
            ValidatedInvoice validated => OnValidated(validated),
            GeneratedInvoice generated => OnGenerated(generated),
            SentInvoice sent => OnSent(sent),
            InvalidInvoice invalid => OnInvalid(invalid),
            _ => throw new InvalidOperationException($"Unknown invoice state: {entity?.GetType().Name}")
        };

        protected virtual IInvoice OnUnvalidated(UnvalidatedInvoice entity) => entity;
        protected virtual IInvoice OnValidated(ValidatedInvoice entity) => entity;
        protected virtual IInvoice OnGenerated(GeneratedInvoice entity) => entity;
        protected virtual IInvoice OnSent(SentInvoice entity) => entity;
        protected virtual IInvoice OnInvalid(InvalidInvoice entity) => entity;
    }
}