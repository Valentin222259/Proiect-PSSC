// Create entity states for Shipment following the pattern from copilot-instructions.md
// 
// IMPORTANT: Define IShipment interface at namespace level (not nested in static class)
//
// State flow:
// UnvalidatedShipment → ValidatedShipment → PreparedShipment → DeliveredShipment
//                    ↘ InvalidShipment
//
// States needed:
// 1. UnvalidatedShipment: Raw input with string properties: orderId, customerId, deliveryAddress, items (productId, quantity)
// 2. ValidatedShipment: After validation with value objects: OrderId, CustomerId, Address deliveryAddress, IReadOnlyCollection<ShipmentItem>
// 3. PreparedShipment: After shipment preparation: ValidatedShipment properties + string trackingNumber, DateTime preparedAt, string carrier
// 4. DeliveredShipment: Final state after delivery: PreparedShipment properties + DateTime deliveredAt, string recipientName, string deliverySignature
// 5. InvalidShipment: When validation/processing fails, contains IEnumerable<string> Reasons
//
// Define these records:
// - UnvalidatedShipmentItem(string productId, int quantity) - for raw items
// - ShipmentItem(ProductId productId, int quantity) - for validated items
//
// Define interface at namespace level:
// public interface IShipment { }
//
// Then define all state records implementing IShipment:
// public record UnvalidatedShipment(...) : IShipment;
// public record ValidatedShipment(...) : IShipment;
// public record PreparedShipment(...) : IShipment;
// public record DeliveredShipment(...) : IShipment;
// public record InvalidShipment(IEnumerable<string> Reasons) : IShipment;
//
// Use IReadOnlyCollection for collections

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using Domain.Models.ValueObjects;

namespace Domain.Models.Entities
{
    // Interface at namespace level
    public interface IShipment { }

    // Helper to create IReadOnlyCollection<T> from IEnumerable<T>
    internal static class ShipmentHelpers
    {
        internal static IReadOnlyCollection<T> ToReadOnly<T>(IEnumerable<T>? items)
        {
            if (items is IReadOnlyCollection<T> ric) return ric;
            var list = new List<T>(items ?? Array.Empty<T>());
            return new ReadOnlyCollection<T>(list);
        }
    }

    // Raw item in unvalidated state
    public record UnvalidatedShipmentItem(string ProductId, int Quantity);

    // Validated shipment item
    public record ShipmentItem(ProductId ProductId, int Quantity);

    // 1. UnvalidatedShipment - raw input (strings)
    public record UnvalidatedShipment(string OrderId, string CustomerId, IReadOnlyCollection<UnvalidatedShipmentItem> Items, string DeliveryAddress) : IShipment
    {
        public UnvalidatedShipment(string orderId, string customerId, IEnumerable<UnvalidatedShipmentItem>? items, string deliveryAddress)
            : this(orderId ?? string.Empty, customerId ?? string.Empty, ShipmentHelpers.ToReadOnly(items), deliveryAddress ?? string.Empty)
        {
        }
    }

    // 2. ValidatedShipment
    public record ValidatedShipment(OrderId OrderId, CustomerId CustomerId, IReadOnlyCollection<ShipmentItem> Items, Address DeliveryAddress) : IShipment
    {
        internal ValidatedShipment(OrderId orderId, CustomerId customerId, IEnumerable<ShipmentItem>? items, Address deliveryAddress)
            : this(orderId, customerId, ShipmentHelpers.ToReadOnly(items), deliveryAddress)
        {
        }
    }

    // 3. PreparedShipment
    public record PreparedShipment(OrderId OrderId, CustomerId CustomerId, IReadOnlyCollection<ShipmentItem> Items, Address DeliveryAddress, string TrackingNumber, DateTime PreparedAt, string Carrier) : IShipment
    {
        internal PreparedShipment(ValidatedShipment validated, string trackingNumber, DateTime preparedAt, string carrier)
            : this(validated.OrderId, validated.CustomerId, validated.Items, validated.DeliveryAddress, trackingNumber ?? string.Empty, preparedAt, carrier ?? string.Empty)
        {
        }
    }

    // 4. DeliveredShipment
    public record DeliveredShipment(OrderId OrderId, CustomerId CustomerId, IReadOnlyCollection<ShipmentItem> Items, Address DeliveryAddress, string TrackingNumber, DateTime PreparedAt, string Carrier, DateTime DeliveredAt, string RecipientName, string DeliverySignature) : IShipment
    {
        internal DeliveredShipment(PreparedShipment prepared, DateTime deliveredAt, string recipientName, string deliverySignature)
            : this(prepared.OrderId, prepared.CustomerId, prepared.Items, prepared.DeliveryAddress, prepared.TrackingNumber, prepared.PreparedAt, prepared.Carrier, deliveredAt, recipientName ?? string.Empty, deliverySignature ?? string.Empty)
        {
        }
    }

    // 5. InvalidShipment
    public record InvalidShipment(IReadOnlyCollection<string> Reasons) : IShipment
    {
        public InvalidShipment(IEnumerable<string>? reasons) : this(ShipmentHelpers.ToReadOnly(reasons))
        {
        }
    }
}