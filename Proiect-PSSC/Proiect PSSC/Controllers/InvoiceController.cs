using Microsoft.AspNetCore.Mvc;
using Domain.Workflows;
using Domain.Models.Entities;
using Domain.Models.Commands;
using static Domain.Events.InvoiceGeneratedEvent;
using Proiect_PSSC.Data;
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
    public class InvoiceController : ControllerBase
    {
        private readonly GenerateInvoiceWorkflow _workflow;
        private readonly ApplicationDbContext _dbContext;

        public InvoiceController(GenerateInvoiceWorkflow workflow, ApplicationDbContext dbContext)
        {
            _workflow = workflow;
            _dbContext = dbContext;
        }

        [HttpPost("generate-invoice")]
        public async Task<IActionResult> GenerateInvoice([FromBody] InvoiceRequestDto request)
        {
            // 1. Transform DTO to UnvalidatedInvoice
            var unvalidatedItems = new List<UnvalidatedInvoiceItem>();
            foreach (var item in request.Items)
            {
                unvalidatedItems.Add(new UnvalidatedInvoiceItem(item.ProductId, item.Quantity, item.UnitPrice));
            }

            var unvalidatedInvoice = new UnvalidatedInvoice(
                request.OrderId,
                request.CustomerId,
                unvalidatedItems,
                request.TotalAmount,
                request.BillingAddress
            );

            var command = new GenerateInvoiceCommand(unvalidatedInvoice);

            // 2. Mock dependencies - FIX: Use simpler checks that don't access database with value objects
            Func<string, bool> checkOrder = (id) => true; // ✅ FIXED - Just return true for now
            Func<string, bool> checkCustomer = (id) => id.StartsWith("CUST");
            Func<string, bool> checkProduct = (id) => true;
            Func<string> generateInvoiceNumber = () => $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
            Func<string, string> getCustomerEmail = (id) => $"{id.ToLower()}@example.com";

            // 3. Execute workflow
            var result = _workflow.Execute(
                command,
                checkOrder,
                checkCustomer,
                checkProduct,
                generateInvoiceNumber,
                getCustomerEmail
            );

            // 4. Process result and save to database if successful
            return result switch
            {
                InvoiceGeneratedSucceededEvent success => await SaveInvoiceAndReturnResponse(success),
                InvoiceGeneratedFailedEvent failed => BadRequest(new
                {
                    Message = "Generarea facturii a esuat.",
                    Reasons = failed.Reasons
                }),
                _ => StatusCode(500, "Stare necunoscuta")
            };
        }

        private async Task<IActionResult> SaveInvoiceAndReturnResponse(InvoiceGeneratedSucceededEvent successEvent)
        {
            try
            {
                var sentInvoice = successEvent.Invoice;

                // Add to database
                _dbContext.SentInvoices.Add(sentInvoice);
                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Factura generata cu succes si salvata in baza de date!",
                    InvoiceId = sentInvoice.InvoiceId.Value,
                    InvoiceNumber = sentInvoice.InvoiceNumber,
                    OrderId = sentInvoice.OrderId.Value,
                    CustomerId = sentInvoice.CustomerId.Value,
                    TotalAmount = $"{sentInvoice.TotalAmount.Amount} {sentInvoice.TotalAmount.Currency}",
                    GeneratedAt = sentInvoice.GeneratedAt,
                    SentAt = sentInvoice.SentAt,
                    SentTo = sentInvoice.SentTo,
                    DeliveryMethod = sentInvoice.DeliveryMethod,
                    CsvExport = successEvent.Csv
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Factura a fost procesata dar nu a putut fi salvata in baza de date.",
                    Error = ex.Message
                });
            }
        }
    }

    // DTOs for HTTP request
    public class InvoiceRequestDto
    {
        public string OrderId { get; set; }
        public string CustomerId { get; set; }
        public string BillingAddress { get; set; }
        public string TotalAmount { get; set; }
        public List<InvoiceItemDto> Items { get; set; }
    }

    public class InvoiceItemDto
    {
        public string ProductId { get; set; }
        public int Quantity { get; set; }
        public string UnitPrice { get; set; }
    }
}