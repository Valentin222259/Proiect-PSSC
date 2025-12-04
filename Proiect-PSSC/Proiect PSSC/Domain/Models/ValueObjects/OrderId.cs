// Create OrderId value object following the pattern from copilot-instructions.md
//
// Requirements:
// - Record type with immutability
// - Private constructor with validation
// - Static TryParse method for safe parsing from string
// - Value property of type string
// - Validation: non-empty, alphanumeric with optional hyphens, max 50 characters
// - Pattern: ^ORD-[A-Za-z0-9]{1,45}$
// - Override ToString() for serialization
// - Throw InvalidOrderIdException on invalid input
//
// Example valid OrderIds: "ORD-001", "ORD-12345", "ORD-ABC123"
using System;
using System.Text.RegularExpressions;

namespace Domain.Models.ValueObjects
{
    public record OrderId
    {
        private static readonly Regex ValidPattern = new(@"^ORD-[A-Za-z0-9]{1,45}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);

        public string Value { get; }

        private OrderId(string value) => Value = value;

        /// <summary>
        /// Attempts to parse the input into an <see cref="OrderId"/> without throwing.
        /// Returns false when input is null/whitespace or does not match the required pattern.
        /// </summary>
        public static bool TryParse(string? input, out OrderId orderId)
        {
            orderId = default;

            if (string.IsNullOrWhiteSpace(input))
                return false;

            var trimmed = input.Trim();

            if (trimmed.Length > 50)
                return false;

            if (!ValidPattern.IsMatch(trimmed))
                return false;

            orderId = new OrderId(trimmed);
            return true;
        }

        /// <summary>
        /// Parses the input into an <see cref="OrderId"/> or throws <see cref="InvalidOrderIdException"/>.
        /// </summary>
        /// <exception cref="InvalidOrderIdException">Thrown when the input is invalid.</exception>
        public static OrderId Parse(string? input)
        {
            if (TryParse(input, out var id))
                return id;

            throw new InvalidOrderIdException(input, "OrderId is invalid. Expected pattern: ^ORD-[A-Za-z0-9]{1,45}$ and max length 50.");
        }

        public override string ToString() => Value;
    }

    public sealed class InvalidOrderIdException : ArgumentException
    {
        public string? AttemptedValue { get; }

        public InvalidOrderIdException()
            : base("Invalid OrderId.")
        {
        }

        public InvalidOrderIdException(string? attemptedValue)
            : base("Invalid OrderId.")
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidOrderIdException(string? attemptedValue, string message)
            : base(message)
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidOrderIdException(string? attemptedValue, string message, Exception innerException)
            : base(message, innerException)
        {
            AttemptedValue = attemptedValue;
        }
    }
}