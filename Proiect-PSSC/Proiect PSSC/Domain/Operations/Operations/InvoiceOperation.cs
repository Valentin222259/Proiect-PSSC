// Create InvoiceOperation base class following the pattern from copilot-instructions.md
//
// This is the abstract base class for all Invoice operations
// Follows the pattern: internal abstract class with pattern matching
//
// Inherits from: DomainOperation<IInvoice, object, IInvoice>
//
// Provides:
// - Internal Transform(IInvoice entity) method with pattern matching switch expression
// - Protected virtual OnXxx methods for each state (default returns same entity)
//
// Pattern matching switch expression:
// entity switch
// {
//     UnvalidatedInvoice unvalidated => OnUnvalidated(unvalidated),
//     ValidatedInvoice validated => OnValidated(validated),
//     GeneratedInvoice generated => OnGenerated(generated),
//     SentInvoice sent => OnSent(sent),
//     InvalidInvoice invalid => OnInvalid(invalid),
//     _ => throw new InvalidOperationException($"Unknown invoice state: {entity.GetType().Name}")
// }
//
// Protected virtual methods (all return entity by default):
// - protected virtual IInvoice OnUnvalidated(UnvalidatedInvoice entity) => entity;
// - protected virtual IInvoice OnValidated(ValidatedInvoice entity) => entity;
// - protected virtual IInvoice OnGenerated(GeneratedInvoice entity) => entity;
// - protected virtual IInvoice OnSent(SentInvoice entity) => entity;
// - protected virtual IInvoice OnInvalid(InvalidInvoice entity) => entity;

using System;
using Domain.Models.Entities;

namespace Domain.Operations.Base
{
    internal abstract class InvoiceOperation : DomainOperation<IInvoice, object, IInvoice>
    {
        /// <summary>
        /// Convenience overload when no additional state is required.
        /// </summary>
        internal IInvoice Transform(IInvoice entity) => Transform(entity, null);

        /// <summary>
        /// Dispatches the incoming invoice to the appropriate handler based on its concrete state.
        /// </summary>
        public override IInvoice Transform(IInvoice entity, object? state) => entity switch
        {
            UnvalidatedInvoice unvalidated => OnUnvalidated(unvalidated),
            ValidatedInvoice validated => OnValidated(validated),
            GeneratedInvoice generated => OnGenerated(generated),
            SentInvoice sent => OnSent(sent),
            InvalidInvoice invalid => OnInvalid(invalid),
            _ => throw new InvalidOperationException($"Unknown invoice state: {entity?.GetType().Name}")
        };

        // Protected virtual handlers - default behavior is identity (return same instance)
        protected virtual IInvoice OnUnvalidated(UnvalidatedInvoice entity) => entity;
        protected virtual IInvoice OnValidated(ValidatedInvoice entity) => entity;
        protected virtual IInvoice OnGenerated(GeneratedInvoice entity) => entity;
        protected virtual IInvoice OnSent(SentInvoice entity) => entity;
        protected virtual IInvoice OnInvalid(InvalidInvoice entity) => entity;
    }
}