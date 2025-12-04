// Create entity states for Order following the pattern from copilot-instructions.md
// 
// IMPORTANT: Define IOrder interface at namespace level (not nested in static class)
//
// State flow:
// UnvalidatedOrder → ValidatedOrder → StockReservedOrder → PreparedOrder → DeliveredOrder
//                 ↘ InvalidOrder
//
// States needed:
// 1. UnvalidatedOrder: Raw input with string properties: customerId, items (productId, quantity), deliveryAddress
// 2. ValidatedOrder: After validation with value objects: CustomerId, IReadOnlyCollection<OrderItem>, Address deliveryAddress, Money totalAmount
// 3. StockReservedOrder: After stock reservation: ValidatedOrder properties + string reservationId, DateTime reservedAt
// 4. PreparedOrder: After order preparation: StockReservedOrder properties + DateTime preparedAt, string warehouseLocation
// 5. DeliveredOrder: Final state after delivery: PreparedOrder properties + DateTime deliveredAt, string deliverySignature
// 6. InvalidOrder: When validation/processing fails, contains IEnumerable<string> Reasons
//
// Define these records:
// - UnvalidatedOrderItem(string productId, int quantity) - for raw items
// - OrderItem(ProductId productId, int quantity, Money unitPrice) - for validated items
//
// Define interface at namespace level:
// public interface IOrder { }
//
// Then define all state records implementing IOrder:
// public record UnvalidatedOrder(string CustomerId, IReadOnlyCollection<UnvalidatedOrderItem> Items, string DeliveryAddress) : IOrder;
// public record ValidatedOrder(...) : IOrder;
// public record StockReservedOrder(...) : IOrder;
// public record PreparedOrder(...) : IOrder;
// public record DeliveredOrder(...) : IOrder;
// public record InvalidOrder(IEnumerable<string> Reasons) : IOrder;
//
// Use IReadOnlyCollection for collections

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Domain.Models.ValueObjects;

namespace Domain.Models.Entities
{
    // Interface at namespace level
    public interface IOrder { }

    // Helper to create IReadOnlyCollection<T> from IEnumerable<T>
    internal static class OrderHelpers
    {
        internal static IReadOnlyCollection<T> ToReadOnly<T>(IEnumerable<T>? items)
        {
            if (items is IReadOnlyCollection<T> ric) return ric;
            var list = new List<T>(items ?? Enumerable.Empty<T>());
            return new ReadOnlyCollection<T>(list);
        }
    }

    // Raw item in unvalidated state
    public record UnvalidatedOrderItem(string ProductId, int Quantity);

    // Validated order item
    public record OrderItem(ProductId ProductId, int Quantity, Money UnitPrice);

    // 1. UnvalidatedOrder - raw input (strings)
    public record UnvalidatedOrder(string CustomerId, IReadOnlyCollection<UnvalidatedOrderItem> Items, string DeliveryAddress) : IOrder
    {
        public UnvalidatedOrder(string customerId, IEnumerable<UnvalidatedOrderItem>? items, string deliveryAddress)
            : this(customerId, OrderHelpers.ToReadOnly(items), deliveryAddress)
        {
        }
    }

    // 2. ValidatedOrder
    public record ValidatedOrder(CustomerId CustomerId, IReadOnlyCollection<OrderItem> Items, Address DeliveryAddress, Money TotalAmount) : IOrder
    {
        internal ValidatedOrder(CustomerId customerId, IEnumerable<OrderItem>? items, Address deliveryAddress, Money totalAmount)
            : this(customerId, OrderHelpers.ToReadOnly(items), deliveryAddress, totalAmount)
        {
        }
    }

    // 3. StockReservedOrder
    public record StockReservedOrder(CustomerId CustomerId, IReadOnlyCollection<OrderItem> Items, Address DeliveryAddress, Money TotalAmount, string ReservationId, DateTime ReservedAt) : IOrder
    {
        internal StockReservedOrder(ValidatedOrder validated, string reservationId, DateTime reservedAt)
            : this(validated.CustomerId, validated.Items, validated.DeliveryAddress, validated.TotalAmount, reservationId ?? string.Empty, reservedAt)
        {
        }
    }

    // 4. PreparedOrder
    public record PreparedOrder(CustomerId CustomerId, IReadOnlyCollection<OrderItem> Items, Address DeliveryAddress, Money TotalAmount, string ReservationId, DateTime ReservedAt, DateTime PreparedAt, string WarehouseLocation) : IOrder
    {
        internal PreparedOrder(StockReservedOrder reserved, DateTime preparedAt, string warehouseLocation)
            : this(reserved.CustomerId, reserved.Items, reserved.DeliveryAddress, reserved.TotalAmount, reserved.ReservationId, reserved.ReservedAt, preparedAt, warehouseLocation ?? string.Empty)
        {
        }
    }

    // 5. DeliveredOrder
    public record DeliveredOrder(CustomerId CustomerId, IReadOnlyCollection<OrderItem> Items, Address DeliveryAddress, Money TotalAmount, string ReservationId, DateTime ReservedAt, DateTime PreparedAt, string WarehouseLocation, DateTime DeliveredAt, string DeliverySignature) : IOrder
    {
        internal DeliveredOrder(PreparedOrder prepared, DateTime deliveredAt, string deliverySignature)
            : this(prepared.CustomerId, prepared.Items, prepared.DeliveryAddress, prepared.TotalAmount, prepared.ReservationId, prepared.ReservedAt, prepared.PreparedAt, prepared.WarehouseLocation, deliveredAt, deliverySignature ?? string.Empty)
        {
        }
    }

    // 6. InvalidOrder
    public record InvalidOrder(IReadOnlyCollection<string> Reasons) : IOrder
    {
        public InvalidOrder(IEnumerable<string>? reasons) : this(OrderHelpers.ToReadOnly(reasons))
        {
        }
    }
}