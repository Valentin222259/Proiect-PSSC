using Microsoft.AspNetCore.Mvc;
using Domain.Workflows;
using Domain.Models.Entities;
using Domain.Models.Commands;
using static Domain.Events.ShipmentDeliveredEvent;
using Proiect_PSSC.Data;
using Proiect_PSSC.DTOs;
using Domain.Models.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Proiect_PSSC.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ShipmentController : ControllerBase
    {
        private readonly PrepareShipmentWorkflow _workflow;
        private readonly ApplicationDbContext _dbContext;

        public ShipmentController(PrepareShipmentWorkflow workflow, ApplicationDbContext dbContext)
        {
            _workflow = workflow;
            _dbContext = dbContext;
        }

        [HttpPost("prepare-shipment")]
        public async Task<IActionResult> PrepareShipment([FromBody] ShipmentRequestDto request)
        {
            // Validate AddressDto
            if (request.DeliveryAddress == null)
            {
                return BadRequest(new { Message = "Delivery address is required." });
            }

            // Convert AddressDto to pipe-delimited string format
            var addressString = request.DeliveryAddress.ToAddressString();

            // 1. Transform DTO to UnvalidatedShipment
            var unvalidatedItems = new List<UnvalidatedShipmentItem>();
            foreach (var item in request.Items)
            {
                unvalidatedItems.Add(new UnvalidatedShipmentItem(item.ProductId, item.Quantity));
            }

            var unvalidatedShipment = new UnvalidatedShipment(
                request.OrderId,
                request.CustomerId,
                unvalidatedItems,
                addressString
            );

            var command = new PrepareShipmentCommand(unvalidatedShipment);

            // 2. Mock dependencies
            Func<string, bool> checkOrder = (id) => true;
            Func<string, bool> checkCustomer = (id) => id.StartsWith("CUST");
            Func<string, bool> checkProduct = (id) => true;
            Func<string> generateTrackingNumber = () => $"TRK-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
            Func<string> assignCarrier = () => new[] { "DHL", "FedEx", "UPS", "USPS" }[new Random().Next(4)];
            Func<string, string> getRecipientName = (id) => $"Customer {id}";
            Func<string> generateDeliverySignature = () => $"SIG-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

            // 3. Execute workflow
            var result = _workflow.Execute(
                command,
                checkOrder,
                checkCustomer,
                checkProduct,
                generateTrackingNumber,
                assignCarrier,
                getRecipientName,
                generateDeliverySignature
            );

            // 4. Process result and save to database if successful
            return result switch
            {
                ShipmentDeliveredSucceededEvent success => await SaveShipmentAndReturnResponse(success),
                ShipmentDeliveredFailedEvent failed => BadRequest(new
                {
                    Message = "Pregatirea livrarii a esuat.",
                    Reasons = failed.Reasons
                }),
                _ => StatusCode(500, "Stare necunoscuta")
            };
        }

        private async Task<IActionResult> SaveShipmentAndReturnResponse(ShipmentDeliveredSucceededEvent successEvent)
        {
            try
            {
                var deliveredShipment = successEvent.Shipment;

                // Add to database
                _dbContext.DeliveredShipments.Add(deliveredShipment);
                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Livrarea pregatita cu succes si salvata in baza de date!",
                    TrackingNumber = deliveredShipment.TrackingNumber,
                    OrderId = deliveredShipment.OrderId.Value,
                    CustomerId = deliveredShipment.CustomerId.Value,
                    Carrier = deliveredShipment.Carrier,
                    PreparedAt = deliveredShipment.PreparedAt,
                    DeliveredAt = deliveredShipment.DeliveredAt,
                    RecipientName = deliveredShipment.RecipientName,
                    DeliverySignature = deliveredShipment.DeliverySignature,
                    CsvExport = successEvent.Csv
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Livrarea a fost procesata dar nu a putut fi salvata in baza de date.",
                    Error = ex.Message
                });
            }
        }
    }

    // DTOs for HTTP request
    public class ShipmentRequestDto
    {
        public string OrderId { get; set; }
        public string CustomerId { get; set; }
        public AddressDto DeliveryAddress { get; set; }
        public List<ShipmentItemDto> Items { get; set; }
    }

    public class ShipmentItemDto
    {
        public string ProductId { get; set; }
        public int Quantity { get; set; }
    }
}