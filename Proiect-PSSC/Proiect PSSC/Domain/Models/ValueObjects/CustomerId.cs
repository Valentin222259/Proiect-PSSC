// Create CustomerId value object following the pattern from copilot-instructions.md
//
// Requirements:
// - Record type with immutability
// - Private constructor with validation
// - Static TryParse method for safe parsing from string
// - Value property of type string
// - Validation: non-empty, alphanumeric with optional hyphens, max 50 characters
// - Pattern: ^CUST-[A-Za-z0-9]{1,45}$
// - Override ToString() for serialization
// - Throw InvalidCustomerIdException on invalid input
//
// Example valid CustomerIds: "CUST-001", "CUST-12345", "CUST-ABC123"
using System;
using System.Text.RegularExpressions;
using Domain.Exceptions;

namespace Domain.Models.ValueObjects
{
    public record CustomerId
    {
        private static readonly Regex ValidPattern = new(@"^CUST-[A-Za-z0-9]{1,45}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);

        public string Value { get; }

        private CustomerId(string value) => Value = value;

        /// <summary>
        /// Attempts to parse the input into a <see cref="CustomerId"/> without throwing.
        /// Returns false when input is null/whitespace or does not match the required pattern.
        /// </summary>
        public static bool TryParse(string? input, out CustomerId customerId)
        {
            customerId = default;

            if (string.IsNullOrWhiteSpace(input))
                return false;

            var trimmed = input.Trim();

            if (trimmed.Length > 50)
                return false;

            if (!ValidPattern.IsMatch(trimmed))
                return false;

            customerId = new CustomerId(trimmed);
            return true;
        }

        /// <summary>
        /// Parses the input into an <see cref="CustomerId"/> or throws <see cref="InvalidCustomerIdException"/>.
        /// </summary>
        /// <exception cref="InvalidCustomerIdException">Thrown when the input is invalid.</exception>
        public static CustomerId Parse(string? input)
        {
            if (TryParse(input, out var id))
                return id;

            throw new InvalidCustomerIdException(input, "CustomerId is invalid. Expected pattern: ^CUST-[A-Za-z0-9]{1,45}$ and max length 50.");
        }

        public override string ToString() => Value;
    }
}