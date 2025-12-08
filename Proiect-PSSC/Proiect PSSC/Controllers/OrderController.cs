using Microsoft.AspNetCore.Mvc;
using Domain.Workflows;
using Domain.Models.Entities;
using Domain.Models.Commands;
using static Domain.Events.OrderPlacedEvent; // Pentru acces la evenimente
using System;
using System.Collections.Generic;

namespace Proiect_PSSC.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly PlaceOrderWorkflow _workflow;

        // Injectăm workflow-ul configurat în Program.cs
        public OrderController(PlaceOrderWorkflow workflow)
        {
            _workflow = workflow;
        }

        [HttpPost("place-order")]
        public IActionResult PlaceOrder([FromBody] OrderRequestDto request)
        {
            // 1. Transformăm DTO-ul primit de la client în UnvalidatedOrder
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

            // 2. Definim funcțiile de dependență (MOCK - simulate pentru test)
            // În realitate, aici ai apela un Repository sau o bază de date

            // Verifică dacă clientul începe cu "CUST"
            Func<string, bool> checkCustomer = (id) => id.StartsWith("CUST");

            // Orice produs e valid
            Func<string, bool> checkProduct = (id) => true;

            // Stocul e mereu 100
            Func<string, int> getStock = (id) => 100;

            // Rezervarea returnează un ID unic
            Func<string, int, string> reserveStock = (id, qty) => $"RES-{Guid.NewGuid().ToString().Substring(0, 8)}";

            // 3. Executăm Workflow-ul
            var result = _workflow.Execute(
                command,
                checkCustomer,
                checkProduct,
                getStock,
                reserveStock
            );

            // 4. Returnăm un răspuns HTTP în funcție de rezultat (Pattern Matching)
            return result switch
            {
                OrderPlacedSucceededEvent success => Ok(new
                {
                    Message = "Comanda plasata cu succes!",
                    InvoiceInfo = success.Csv,
                    Data = success.PlacedDate
                }),

                OrderPlacedFailedEvent failed => BadRequest(new
                {
                    Message = "Comanda a esuat.",
                    Reasons = failed.Reasons
                }),

                _ => StatusCode(500, "Stare necunoscuta")
            };
        }
    }

    // DTO-uri simple pentru cererea HTTP
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