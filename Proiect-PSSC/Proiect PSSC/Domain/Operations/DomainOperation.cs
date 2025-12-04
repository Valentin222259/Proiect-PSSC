// Create DomainOperation generic base class following the pattern from copilot-instructions.md
//
// This is the root abstract class for all domain operations
//
// Generic parameters:
// - TEntity: The entity type being transformed (must be notnull)
// - TState: Optional state parameter for transformation (must be class, nullable)
// - TResult: The result type after transformation
//
// Single abstract method:
// - Transform(TEntity entity, TState? state): Transforms entity with optional state
//
// This class is inherited by specific operation base classes (OrderOperation, InvoiceOperation, etc.)
using System;

namespace Domain.Operations
{
    public abstract class DomainOperation<TEntity, TState, TResult>
        where TEntity : notnull
        where TState : class
    {
        /// <summary>
        /// Transform the provided <paramref name="entity"/> using an optional <paramref name="state"/>.
        /// Implementations must perform the operation's transformation logic and return a result.
        /// </summary>
        public abstract TResult Transform(TEntity entity, TState? state);

        /// <summary>
        /// Convenience overload when no additional state is required.
        /// </summary>
        public TResult Transform(TEntity entity) => Transform(entity, null);
    }
}