// Create DeliverShipmentOperation following the pattern from copilot-instructions.md
//
// This operation transforms PreparedShipment to DeliveredShipment
//
// Dependencies:
// - Func<string, string, bool> confirmDelivery (passed via constructor): Confirms delivery with carrier (trackingNumber, recipientName) => success
// - Func<string, string> getRecipientName (passed via constructor): Gets recipient name from customer records (customerId) => recipient name
//
// Business logic:
// - Create empty error list
// - Get recipient name using getRecipientName(shipment.CustomerId.ToString())
// - If recipient name is null or empty, add error: "Recipient name not found for customer ({shipment.CustomerId})"
// - Confirm delivery using confirmDelivery(shipment.TrackingNumber, recipientName)
// - If confirmation returns false, add error: "Failed to confirm delivery for tracking number ({shipment.TrackingNumber})"
// - Generate delivery signature as "SIG-{trackingNumber}-{DateTime.UtcNow.Ticks}"
// - Set deliveredAt to DateTime.UtcNow
// - If any errors exist, return new InvalidShipment(errors)
// - Return new DeliveredShipment with all PreparedShipment properties + deliveredAt + recipientName + deliverySignature
//
// Override OnPrepared method
// Return either DeliveredShipment or InvalidShipment based on delivery confirmation results
//
// Constructor signature:
// internal DeliverShipmentOperation(Func<string, string, bool> confirmDelivery, Func<string, string> getRecipientName)

using System;
using System.Collections.Generic;
using Domain.Models.Entities;
using Domain.Operations.Base;

namespace Domain.Operations.Shipment
{
    internal sealed class DeliverShipmentOperation : ShipmentOperation
    {
        private readonly Func<string, string, bool> confirmDelivery;
        private readonly Func<string, string> getRecipientName;

        internal DeliverShipmentOperation(Func<string, string, bool> confirmDelivery, Func<string, string> getRecipientName)
        {
            this.confirmDelivery = confirmDelivery ?? throw new ArgumentNullException(nameof(confirmDelivery));
            this.getRecipientName = getRecipientName ?? throw new ArgumentNullException(nameof(getRecipientName));
        }

        protected override IShipment OnPrepared(PreparedShipment prepared)
        {
            if (prepared is null) throw new ArgumentNullException(nameof(prepared));

            var errors = new List<string>();

            string? recipientName = null;
            try
            {
                recipientName = getRecipientName(prepared.CustomerId.ToString());
            }
            catch (Exception ex)
            {
                recipientName = null;
                errors.Add($"Recipient name not found for customer ({prepared.CustomerId}): {ex.Message}");
            }

            if (string.IsNullOrWhiteSpace(recipientName))
            {
                errors.Add($"Recipient name not found for customer ({prepared.CustomerId})");
            }

            bool confirmed = false;
            if (!string.IsNullOrWhiteSpace(recipientName))
            {
                try
                {
                    confirmed = confirmDelivery(prepared.TrackingNumber, recipientName);
                }
                catch (Exception ex)
                {
                    confirmed = false;
                    errors.Add($"Failed to confirm delivery for tracking number ({prepared.TrackingNumber}): {ex.Message}");
                }

                if (!confirmed)
                {
                    errors.Add($"Failed to confirm delivery for tracking number ({prepared.TrackingNumber})");
                }
            }

            var deliveredAt = DateTime.UtcNow;
            var deliverySignature = $"SIG-{prepared.TrackingNumber}-{DateTime.UtcNow.Ticks}";

            if (errors.Count > 0)
                return new InvalidShipment(errors);

            return new DeliveredShipment(prepared, deliveredAt, recipientName!, deliverySignature);
        }
    }
}