// Create PrepareShipmentOperation following the pattern from copilot-instructions.md
//
// This operation transforms ValidatedShipment to PreparedShipment
//
// Dependencies:
// - Func<string, string> generateTrackingNumber (passed via constructor): Generates tracking number for carrier (carrier name) => tracking number
// - Func<string, string> assignCarrier (passed via constructor): Assigns carrier based on delivery address (address) => carrier name
//
// Business logic:
// - Create empty error list
// - Assign carrier using assignCarrier(shipment.DeliveryAddress.ToString())
// - If carrier is null or empty, add error: "Failed to assign carrier for address ({shipment.DeliveryAddress})"
// - Generate tracking number using generateTrackingNumber(carrier)
// - If tracking number is null or empty, add error: "Failed to generate tracking number"
// - Set preparedAt to DateTime.UtcNow
// - If any errors exist, return new InvalidShipment(errors)
// - Return new PreparedShipment with all ValidatedShipment properties + trackingNumber + preparedAt + carrier
//
// Override OnValidated method
// Return either PreparedShipment or InvalidShipment based on preparation results
//
// Constructor signature:
// internal PrepareShipmentOperation(Func<string, string> generateTrackingNumber, Func<string, string> assignCarrier)

using System;
using System.Collections.Generic;
using Domain.Models.Entities;
using Domain.Operations.Base;

namespace Domain.Operations.Shipment
{
    internal sealed class PrepareShipmentOperation : ShipmentOperation
    {
        private readonly Func<string, string> generateTrackingNumber;
        private readonly Func<string, string> assignCarrier;

        internal PrepareShipmentOperation(Func<string, string> generateTrackingNumber, Func<string, string> assignCarrier)
        {
            this.generateTrackingNumber = generateTrackingNumber ?? throw new ArgumentNullException(nameof(generateTrackingNumber));
            this.assignCarrier = assignCarrier ?? throw new ArgumentNullException(nameof(assignCarrier));
        }

        protected override IShipment OnValidated(ValidatedShipment shipment)
        {
            if (shipment is null) throw new ArgumentNullException(nameof(shipment));

            var errors = new List<string>();

            string? carrier = null;
            try
            {
                carrier = assignCarrier(shipment.DeliveryAddress.ToString());
            }
            catch (Exception ex)
            {
                carrier = null;
                errors.Add($"Failed to assign carrier for address ({shipment.DeliveryAddress}): {ex.Message}");
            }

            if (string.IsNullOrWhiteSpace(carrier))
            {
                errors.Add($"Failed to assign carrier for address ({shipment.DeliveryAddress})");
            }

            string? trackingNumber = null;
            if (!string.IsNullOrWhiteSpace(carrier))
            {
                try
                {
                    trackingNumber = generateTrackingNumber(carrier);
                }
                catch (Exception ex)
                {
                    trackingNumber = null;
                    errors.Add($"Failed to generate tracking number: {ex.Message}");
                }

                if (string.IsNullOrWhiteSpace(trackingNumber))
                {
                    errors.Add("Failed to generate tracking number");
                }
            }

            var preparedAt = DateTime.UtcNow;

            if (errors.Count > 0)
                return new InvalidShipment(errors);

            return new PreparedShipment(shipment, trackingNumber!, preparedAt, carrier!);
        }
    }
}