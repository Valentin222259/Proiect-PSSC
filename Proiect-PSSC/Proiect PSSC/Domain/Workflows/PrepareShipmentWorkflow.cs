using Domain.Models.Commands;
using Domain.Models.Entities;
using Domain.Operations;
using static Domain.Events.ShipmentDeliveredEvent;
using System;

namespace Domain.Workflows
{
    public class PrepareShipmentWorkflow
    {
        // Execute method receives the command and dependencies
        public IShipmentDeliveredEvent Execute(
            PrepareShipmentCommand command,
            Func<string, bool> checkOrderExists,
            Func<string, bool> checkCustomerExists,
            Func<string, bool> checkProductExists,
            Func<string> generateTrackingNumber,
            Func<string> assignCarrier,
            Func<string, string> getRecipientName,
            Func<string> generateDeliverySignature
        )
        {
            // 1. Start with UnvalidatedShipment (from command)
            IShipment shipment = command.InputShipment;

            // 2. Validate (Unvalidated -> Validated or Invalid)
            shipment = new ValidateShipmentOperation(checkOrderExists, checkCustomerExists, checkProductExists)
                .Transform(shipment);

            // 3. Prepare and Deliver (Validated -> Prepared -> Delivered)
            shipment = new PrepareAndDeliverShipmentOperation(
                    generateTrackingNumber,
                    assignCarrier,
                    getRecipientName,
                    generateDeliverySignature)
                .Transform(shipment);

            // 4. Convert to Event
            return shipment.ToEvent();
        }
    }
}