// Create OrderOperation base class following the pattern from copilot-instructions.md
//
// This is the abstract base class for all Order operations
// Follows the pattern: internal abstract class with pattern matching
//
// Inherits from: DomainOperation<IOrder, object, IOrder>
//
// Provides:
// - Internal Transform(IOrder entity) method with pattern matching switch expression
// - Protected virtual OnXxx methods for each state (default returns same entity)
//
// Pattern matching switch expression:
// entity switch
// {
//     UnvalidatedOrder unvalidated => OnUnvalidated(unvalidated),
//     ValidatedOrder validated => OnValidated(validated),
//     StockReservedOrder stockReserved => OnStockReserved(stockReserved),
//     PreparedOrder prepared => OnPrepared(prepared),
//     DeliveredOrder delivered => OnDelivered(delivered),
//     InvalidOrder invalid => OnInvalid(invalid),
//     _ => throw new InvalidOperationException($"Unknown order state: {entity.GetType().Name}")
// }
//
// Protected virtual methods (all return entity by default):
// - protected virtual IOrder OnUnvalidated(UnvalidatedOrder entity) => entity;
// - protected virtual IOrder OnValidated(ValidatedOrder entity) => entity;
// - protected virtual IOrder OnStockReserved(StockReservedOrder entity) => entity;
// - protected virtual IOrder OnPrepared(PreparedOrder entity) => entity;
// - protected virtual IOrder OnDelivered(DeliveredOrder entity) => entity;
// - protected virtual IOrder OnInvalid(InvalidOrder entity) => entity;

using System;
using Domain.Models.Entities;

namespace Domain.Operations.Base
{
    internal abstract class OrderOperation : DomainOperation<IOrder, object, IOrder>
    {
        /// <summary>
        /// Convenience overload when no additional state is required.
        /// </summary>
        internal IOrder Transform(IOrder entity) => Transform(entity, null);

        /// <summary>
        /// Main dispatcher that routes the incoming IOrder to the appropriate handler.
        /// </summary>
        public override IOrder Transform(IOrder entity, object? state) => entity switch
        {
            UnvalidatedOrder unvalidated => OnUnvalidated(unvalidated),
            ValidatedOrder validated => OnValidated(validated),
            StockReservedOrder stockReserved => OnStockReserved(stockReserved),
            PreparedOrder prepared => OnPrepared(prepared),
            DeliveredOrder delivered => OnDelivered(delivered),
            InvalidOrder invalid => OnInvalid(invalid),
            _ => throw new InvalidOperationException($"Unknown order state: {entity?.GetType().Name}")
        };

        // Protected virtual handlers - default implementation returns the same entity (identity)
        protected virtual IOrder OnUnvalidated(UnvalidatedOrder entity) => entity;
        protected virtual IOrder OnValidated(ValidatedOrder entity) => entity;
        protected virtual IOrder OnStockReserved(StockReservedOrder entity) => entity;
        protected virtual IOrder OnPrepared(PreparedOrder entity) => entity;
        protected virtual IOrder OnDelivered(DeliveredOrder entity) => entity;
        protected virtual IOrder OnInvalid(InvalidOrder entity) => entity;
    }
}