using Microsoft.AspNetCore.Mvc;
using Domain.Workflows;
using Domain.Models.Entities;
using Domain.Models.Commands;
using static Domain.Events.OrderPlacedEvent;
using Proiect_PSSC.Data;
using Domain.Models.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Proiect_PSSC.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly PlaceOrderWorkflow _workflow;
        private readonly ApplicationDbContext _dbContext;

        public OrderController(PlaceOrderWorkflow workflow, ApplicationDbContext dbContext)
        {
            _workflow = workflow;
            _dbContext = dbContext;
        }

        [HttpPost("place-order")]
        public async Task<IActionResult> PlaceOrder([FromBody] OrderRequestDto request)
        {
            // 1. Transform DTO to UnvalidatedOrder
            var unvalidatedItems = new List<UnvalidatedOrderItem>();
            foreach (var item in request.Items)
            {
                unvalidatedItems.Add(new UnvalidatedOrderItem(item.ProductId, item.Quantity));
            }

            var unvalidatedOrder = new UnvalidatedOrder(
                request.CustomerId,
                unvalidatedItems,
                request.DeliveryAddress
            );

            var command = new PlaceOrderCommand(unvalidatedOrder);

            // 2. Mock dependencies
            Func<string, bool> checkCustomer = (id) => id.StartsWith("CUST");
            Func<string, bool> checkProduct = (id) => true;
            Func<string, int> getStock = (id) => 100;  
            Func<string, int, string> reserveStock = (id, qty) => $"RES-{Guid.NewGuid().ToString().Substring(0, 8)}";

            // 3. Execute workflow
            var result = _workflow.Execute(
                command,
                checkCustomer,
                checkProduct,
                getStock,        
                reserveStock
            );

            // 4. Process result and save to database if successful
            return result switch
            {
                OrderPlacedSucceededEvent success => await SaveOrderAndReturnResponse(success),
                OrderPlacedFailedEvent failed => BadRequest(new
                {
                    Message = "Comanda a esuat.",
                    Reasons = failed.Reasons
                }),
                _ => StatusCode(500, "Stare necunoscuta")
            };
        }

        private async Task<IActionResult> SaveOrderAndReturnResponse(OrderPlacedSucceededEvent successEvent)
        {
            try
            {
                // Convert StockReservedOrder to DeliveredOrder
                var stockReserved = successEvent.Order;
                
                // Create a PreparedOrder (simulate order preparation)
                var preparedOrder = new PreparedOrder(
                    stockReserved,
                    DateTime.UtcNow,
                    "Warehouse-A"
                );

                // Create a DeliveredOrder (simulate order delivery)
                var deliveredOrder = new DeliveredOrder(
                    preparedOrder,
                    DateTime.UtcNow,
                    "SIGNATURE-" + Guid.NewGuid().ToString().Substring(0, 8)
                );

                // Add to database
                _dbContext.DeliveredOrders.Add(deliveredOrder);
                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Comanda plasata cu succes si salvata in baza de date!",
                    OrderId = deliveredOrder.CustomerId.Value,
                    InvoiceInfo = successEvent.Csv,
                    PlacedDate = successEvent.PlacedDate,
                    DeliveredAt = deliveredOrder.DeliveredAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Comanda a fost procesata dar nu a putut fi salvata in baza de date.",
                    Error = ex.Message
                });
            }
        }
    }

    // Simple DTOs for HTTP request
    public class OrderRequestDto
    {
        public string CustomerId { get; set; }
        public string DeliveryAddress { get; set; }
        public List<OrderItemDto> Items { get; set; }
    }

    public class OrderItemDto
    {
        public string ProductId { get; set; }
        public int Quantity { get; set; }
    }
}