// Create ShipmentOperation base class following the pattern from copilot-instructions.md
//
// This is the abstract base class for all Shipment operations
// Follows the pattern: internal abstract class with pattern matching
//
// Inherits from: DomainOperation<IShipment, object, IShipment>
//
// Provides:
// - Internal Transform(IShipment entity) method with pattern matching switch expression
// - Protected virtual OnXxx methods for each state (default returns same entity)
//
// Pattern matching switch expression:
// entity switch
// {
//     UnvalidatedShipment unvalidated => OnUnvalidated(unvalidated),
//     ValidatedShipment validated => OnValidated(validated),
//     PreparedShipment prepared => OnPrepared(prepared),
//     DeliveredShipment delivered => OnDelivered(delivered),
//     InvalidShipment invalid => OnInvalid(invalid),
//     _ => throw new InvalidOperationException($"Unknown shipment state: {entity.GetType().Name}")
// }
//
// Protected virtual methods (all return entity by default):
// - protected virtual IShipment OnUnvalidated(UnvalidatedShipment entity) => entity;
// - protected virtual IShipment OnValidated(ValidatedShipment entity) => entity;
// - protected virtual IShipment OnPrepared(PreparedShipment entity) => entity;
// - protected virtual IShipment OnDelivered(DeliveredShipment entity) => entity;
// - protected virtual IShipment OnInvalid(InvalidShipment entity) => entity;

using System;
using Domain.Models.Entities;
using Domain.Operations;

namespace Domain.Operations.Base
{
    internal abstract class ShipmentOperation : DomainOperation<IShipment, object, IShipment>
    {
        /// <summary>
        /// Convenience overload when no additional state is provided.
        /// </summary>
        internal IShipment Transform(IShipment entity) => Transform(entity, null);

        /// <summary>
        /// Dispatches the incoming IShipment to the appropriate handler based on its concrete state.
        /// </summary>
        public override IShipment Transform(IShipment entity, object? state) => entity switch
        {
            UnvalidatedShipment unvalidated => OnUnvalidated(unvalidated),
            ValidatedShipment validated => OnValidated(validated),
            PreparedShipment prepared => OnPrepared(prepared),
            DeliveredShipment delivered => OnDelivered(delivered),
            InvalidShipment invalid => OnInvalid(invalid),
            _ => throw new InvalidOperationException($"Unknown shipment state: {entity?.GetType().Name}")
        };

        // Protected virtual handlers - default behavior is identity (return same instance)
        protected virtual IShipment OnUnvalidated(UnvalidatedShipment entity) => entity;
        protected virtual IShipment OnValidated(ValidatedShipment entity) => entity;
        protected virtual IShipment OnPrepared(PreparedShipment entity) => entity;
        protected virtual IShipment OnDelivered(DeliveredShipment entity) => entity;
        protected virtual IShipment OnInvalid(InvalidShipment entity) => entity;
    }
}