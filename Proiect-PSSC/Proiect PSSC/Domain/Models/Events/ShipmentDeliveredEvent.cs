using Domain.Models.Entities;
using System;
using System.Collections.Generic;

namespace Domain.Events
{
    public static class ShipmentDeliveredEvent
    {
        // Interface marker for shipment events
        public interface IShipmentDeliveredEvent { }

        // Success event - contains the delivered shipment
        public record ShipmentDeliveredSucceededEvent : IShipmentDeliveredEvent
        {
            public string TrackingNumber { get; }
            public DateTime DeliveredAt { get; }
            public DeliveredShipment Shipment { get; }
            public string Csv { get; } // For export/reporting

            internal ShipmentDeliveredSucceededEvent(DeliveredShipment shipment, DateTime deliveredAt)
            {
                Shipment = shipment;
                DeliveredAt = deliveredAt;
                TrackingNumber = shipment.TrackingNumber;
                Csv = $"{shipment.TrackingNumber},{shipment.OrderId.Value},{shipment.CustomerId.Value},{shipment.Carrier},{shipment.RecipientName}";
            }
        }

        // Failure event - contains error reasons
        public record ShipmentDeliveredFailedEvent : IShipmentDeliveredEvent
        {
            public IEnumerable<string> Reasons { get; }

            internal ShipmentDeliveredFailedEvent(IEnumerable<string> reasons)
            {
                Reasons = reasons;
            }
        }

        // Extension method to convert IShipment state to Event
        public static IShipmentDeliveredEvent ToEvent(this IShipment shipment) => shipment switch
        {
            // If we reached DeliveredShipment state, delivery succeeded
            DeliveredShipment delivered => new ShipmentDeliveredSucceededEvent(delivered, delivered.DeliveredAt),

            // If invalid, return failure event with reasons
            InvalidShipment invalid => new ShipmentDeliveredFailedEvent(invalid.Reasons),

            // Any other intermediate state is unexpected at this point
            _ => new ShipmentDeliveredFailedEvent(new[] { $"Unexpected shipment state: {shipment.GetType().Name}" })
        };
    }
}