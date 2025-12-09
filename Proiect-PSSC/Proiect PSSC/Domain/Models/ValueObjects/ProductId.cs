// Create ProductId value object following the pattern from copilot-instructions.md
//
// Requirements:
// - Record type with immutability
// - Private constructor with validation
// - Static TryParse method for safe parsing from string
// - Value property of type string
// - Validation: non-empty, alphanumeric with optional hyphens/underscores, max 50 characters
// - Pattern: ^[A-Za-z0-9_-]{1,50}$
// - Override ToString() for serialization
// - Throw InvalidProductIdException on invalid input
//
// Example valid ProductIds: "PROD-001", "SKU_12345", "ITEM-ABC-123"
using System;
using System.Text.RegularExpressions;
using Domain.Exceptions;

namespace Domain.Models.ValueObjects
{
    public record ProductId
    {
        private static readonly Regex ValidPattern = new(@"^[A-Za-z0-9_-]{1,50}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);

        public string Value { get; }

        private ProductId(string value) => Value = value;

        /// <summary>
        /// Attempts to parse the input into a <see cref="ProductId"/> without throwing.
        /// Returns false when input is null/whitespace or does not match the required pattern.
        /// </summary>
        public static bool TryParse(string? input, out ProductId productId)
        {
            productId = default;

            if (string.IsNullOrWhiteSpace(input))
                return false;

            var trimmed = input.Trim();

            if (!ValidPattern.IsMatch(trimmed))
                return false;

            productId = new ProductId(trimmed);
            return true;
        }

        /// <summary>
        /// Parses the input into a <see cref="ProductId"/> or throws <see cref="InvalidProductIdException"/>.
        /// </summary>
        /// <exception cref="InvalidProductIdException">Thrown when the input is invalid.</exception>
        public static ProductId Parse(string? input)
        {
            if (TryParse(input, out var id))
                return id;

            throw new InvalidProductIdException(input, "ProductId is invalid. Expected pattern: ^[A-Za-z0-9_-]{1,50}$.");
        }

        public override string ToString() => Value;
    }
}