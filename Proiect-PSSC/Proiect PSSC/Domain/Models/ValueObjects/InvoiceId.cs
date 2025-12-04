// Create InvoiceId value object following the pattern from copilot-instructions.md
//
// Requirements:
// - Record type with immutability
// - Private constructor with validation
// - Static TryParse method for safe parsing from string
// - Value property of type string
// - Validation: non-empty, alphanumeric with optional hyphens, max 50 characters
// - Pattern: ^INV-[A-Za-z0-9]{1,45}$
// - Override ToString() for serialization
// - Throw InvalidInvoiceIdException on invalid input
//
// Example valid InvoiceIds: "INV-001", "INV-12345", "INV-2024-001"
using System;
using System.Text.RegularExpressions;

namespace Domain.Models.ValueObjects
{
    public record InvoiceId
    {
        private static readonly Regex ValidPattern = new(@"^INV-[A-Za-z0-9]{1,45}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);

        public string Value { get; }

        private InvoiceId(string value) => Value = value;

        /// <summary>
        /// Attempts to parse the input into an <see cref="InvoiceId"/> without throwing.
        /// Returns false when input is null/whitespace or does not match the required pattern.
        /// </summary>
        public static bool TryParse(string? input, out InvoiceId invoiceId)
        {
            invoiceId = default;

            if (string.IsNullOrWhiteSpace(input))
                return false;

            var trimmed = input.Trim();

            if (trimmed.Length > 50)
                return false;

            if (!ValidPattern.IsMatch(trimmed))
                return false;

            invoiceId = new InvoiceId(trimmed);
            return true;
        }

        /// <summary>
        /// Parses the input into an <see cref="InvoiceId"/> or throws <see cref="InvalidInvoiceIdException"/>.
        /// </summary>
        /// <exception cref="InvalidInvoiceIdException">Thrown when the input is invalid.</exception>
        public static InvoiceId Parse(string? input)
        {
            if (TryParse(input, out var id))
                return id;

            throw new InvalidInvoiceIdException(input, "InvoiceId is invalid. Expected pattern: ^INV-[A-Za-z0-9]{1,45}$ and max length 50.");
        }

        public override string ToString() => Value;
    }

    public sealed class InvalidInvoiceIdException : ArgumentException
    {
        public string? AttemptedValue { get; }

        public InvalidInvoiceIdException()
            : base("Invalid InvoiceId.")
        {
        }

        public InvalidInvoiceIdException(string? attemptedValue)
            : base("Invalid InvoiceId.")
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidInvoiceIdException(string? attemptedValue, string message)
            : base(message)
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidInvoiceIdException(string? attemptedValue, string message, Exception innerException)
            : base(message, innerException)
        {
            AttemptedValue = attemptedValue;
        }
    }
}