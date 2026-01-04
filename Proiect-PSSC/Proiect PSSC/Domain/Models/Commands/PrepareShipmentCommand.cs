using Domain.Models.Entities;

namespace Domain.Models.Commands
{
    // Command to prepare and deliver a shipment
    // Input: UnvalidatedShipment
    // Used by: PrepareShipmentWorkflow
    public record PrepareShipmentCommand(UnvalidatedShipment InputShipment);
}