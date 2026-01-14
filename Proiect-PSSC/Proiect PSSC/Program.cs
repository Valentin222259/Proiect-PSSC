using Domain.Models.ValueObjects;
using Domain.Workflows;
using Microsoft.EntityFrameworkCore;
using Proiect_PSSC.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // Portul de Vite
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register all workflows
builder.Services.AddTransient<PlaceOrderWorkflow>();
builder.Services.AddTransient<GenerateInvoiceWorkflow>();      
builder.Services.AddTransient<PrepareShipmentWorkflow>();      

var app = builder.Build();

app.UseCors("AllowFrontend");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // DEVELOPMENT ONLY: Endpoint to clear all data from tables
    app.MapDelete("/dev/clear-data", async (ApplicationDbContext dbContext) =>
    {
        try
        {
            // Delete data in correct order (respecting foreign keys)
            dbContext.DeliveredShipments.RemoveRange(dbContext.DeliveredShipments);
            dbContext.SentInvoices.RemoveRange(dbContext.SentInvoices);
            dbContext.DeliveredOrders.RemoveRange(dbContext.DeliveredOrders);
            
            await dbContext.SaveChangesAsync();
            
            // Reset identity columns to start from 1
            await dbContext.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('DeliveredOrders', RESEED, 0)");
            await dbContext.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('DeliveredShipments', RESEED, 0)");
            await dbContext.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('OrderItems', RESEED, 0)");
            await dbContext.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('ShipmentItems', RESEED, 0)");
            await dbContext.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('InvoiceItems', RESEED, 0)");
            
            return Results.Ok(new 
            { 
                Message = "All data cleared successfully and identity columns reset!",
                TablesCleared = new[] { "DeliveredShipments", "SentInvoices", "DeliveredOrders" },
                IdentityReset = new[] { "DeliveredOrders", "DeliveredShipments", "OrderItems", "ShipmentItems", "InvoiceItems" }
            });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Failed to clear data: {ex.Message}");
        }
    });
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();

public class AddressDto
{
    public string Street { get; set; }
    public string City { get; set; }
    public string PostalCode { get; set; }
    public string Country { get; set; }
}
