// Transforms ValidatedShipment -> PreparedShipment -> DeliveredShipment
//
// Dependencies:
// - Func<string> generateTrackingNumber: Generates unique tracking number
// - Func<string> assignCarrier: Assigns shipping carrier
// - Func<string, string> getRecipientName: Gets recipient name by customerId
// - Func<string> generateDeliverySignature: Generates delivery confirmation signature
//
// Steps:
// 1. Generate tracking number and assign carrier
// 2. Create PreparedShipment with preparation timestamp
// 3. Get recipient name
// 4. Generate delivery signature
// 5. Create DeliveredShipment with delivery timestamp

using System;
using Domain.Models.Entities;

namespace Domain.Operations
{
    internal sealed class PrepareAndDeliverShipmentOperation : ShipmentOperation
    {
        private readonly Func<string> generateTrackingNumber;
        private readonly Func<string> assignCarrier;
        private readonly Func<string, string> getRecipientName;
        private readonly Func<string> generateDeliverySignature;

        internal PrepareAndDeliverShipmentOperation(
            Func<string> generateTrackingNumber,
            Func<string> assignCarrier,
            Func<string, string> getRecipientName,
            Func<string> generateDeliverySignature)
        {
            this.generateTrackingNumber = generateTrackingNumber ?? throw new ArgumentNullException(nameof(generateTrackingNumber));
            this.assignCarrier = assignCarrier ?? throw new ArgumentNullException(nameof(assignCarrier));
            this.getRecipientName = getRecipientName ?? throw new ArgumentNullException(nameof(getRecipientName));
            this.generateDeliverySignature = generateDeliverySignature ?? throw new ArgumentNullException(nameof(generateDeliverySignature));
        }

        protected override IShipment OnValidated(ValidatedShipment validated)
        {
            // Step 1: Prepare shipment
            var trackingNumber = generateTrackingNumber();
            var carrier = assignCarrier();
            var preparedAt = DateTime.UtcNow;
            var prepared = new PreparedShipment(validated, trackingNumber, preparedAt, carrier);

            // Step 2: Deliver shipment
            var recipientName = getRecipientName(validated.CustomerId.Value);
            var deliverySignature = generateDeliverySignature();
            var deliveredAt = DateTime.UtcNow;

            return new DeliveredShipment(prepared, deliveredAt, recipientName, deliverySignature);
        }
    }
}