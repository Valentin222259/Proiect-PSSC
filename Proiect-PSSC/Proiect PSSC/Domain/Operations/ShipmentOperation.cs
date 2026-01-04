// Shipment operation base class following the pattern from copilot-instructions.md
//
// This is the abstract base class for all Shipment operations
// Inherits from: DomainOperation<IShipment, object, IShipment>
//
// Pattern matching for shipment states:
// - UnvalidatedShipment -> OnUnvalidated
// - ValidatedShipment -> OnValidated
// - PreparedShipment -> OnPrepared
// - DeliveredShipment -> OnDelivered
// - InvalidShipment -> OnInvalid

using System;
using Domain.Models.Entities;

namespace Domain.Operations
{
    internal abstract class ShipmentOperation : DomainOperation<IShipment, object, IShipment>
    {
        internal IShipment Transform(IShipment entity) => Transform(entity, null);

        public override IShipment Transform(IShipment entity, object? state) => entity switch
        {
            UnvalidatedShipment unvalidated => OnUnvalidated(unvalidated),
            ValidatedShipment validated => OnValidated(validated),
            PreparedShipment prepared => OnPrepared(prepared),
            DeliveredShipment delivered => OnDelivered(delivered),
            InvalidShipment invalid => OnInvalid(invalid),
            _ => throw new InvalidOperationException($"Unknown shipment state: {entity?.GetType().Name}")
        };

        protected virtual IShipment OnUnvalidated(UnvalidatedShipment entity) => entity;
        protected virtual IShipment OnValidated(ValidatedShipment entity) => entity;
        protected virtual IShipment OnPrepared(PreparedShipment entity) => entity;
        protected virtual IShipment OnDelivered(DeliveredShipment entity) => entity;
        protected virtual IShipment OnInvalid(InvalidShipment entity) => entity;
    }
}