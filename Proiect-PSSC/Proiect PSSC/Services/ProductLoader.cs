using ClosedXML.Excel;
using Proiect_PSSC.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Proiect_PSSC.Services
{
    public class ProductLoader
    {
        private readonly string _excelFilePath;

        public ProductLoader(string excelFilePath)
        {
            _excelFilePath = excelFilePath;
        }

        /// <summary>
        /// Loads products from Excel file.
        /// Expected Excel format:
        /// Row 1: Headers (ProductId | ProductName | Price)
        /// Row 2+: Data
        /// </summary>
        public List<Product> LoadProducts()
        {
            var products = new List<Product>();

            try
            {
                using (var workbook = new XLWorkbook(_excelFilePath))
                {
                    var worksheet = workbook.Worksheet(1); // First sheet
                    var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // Skip header row

                    foreach (var row in rows)
                    {
                        try
                        {
                            var productId = row.Cell(1).Value.ToString().Trim();
                            var productName = row.Cell(2).Value.ToString().Trim();
                            var priceText = row.Cell(3).Value.ToString().Trim();

                            // Validate inputs
                            if (string.IsNullOrWhiteSpace(productId) || string.IsNullOrWhiteSpace(priceText))
                            {
                                Console.WriteLine($"Skipping row with missing data: {productId}");
                                continue;
                            }

                            // Parse price
                            if (!decimal.TryParse(priceText, out var price) || price < 0)
                            {
                                Console.WriteLine($"Invalid price for product {productId}: {priceText}");
                                continue;
                            }

                            products.Add(new Product
                            {
                                Id = productId,
                                Name = productName,
                                Price = price
                            });
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error parsing row: {ex.Message}");
                            continue;
                        }
                    }
                }

                Console.WriteLine($"Successfully loaded {products.Count} products from Excel");
                return products;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading Excel file: {ex.Message}");
                return new List<Product>();
            }
        }
    }
}