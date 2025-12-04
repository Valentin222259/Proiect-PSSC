// Create Address value object following the pattern from copilot-instructions.md
//
// Requirements:
// - Record type with immutability
// - Private constructor with validation
// - Static TryParse method for safe parsing from string (format: "Street|City|PostalCode|Country")
// - Properties: string Street, string City, string PostalCode, string Country
// - Validation: all fields non-empty, PostalCode alphanumeric with optional spaces/hyphens, max 20 chars
// - Pattern for PostalCode: ^[A-Za-z0-9\s-]{1,20}$
// - Override ToString() for serialization (format: "Street, City, PostalCode, Country")
// - Throw InvalidAddressException on invalid input
//
// Example valid Address: "123 Main St, New York, 10001, USA"
using System;
using System.Text.RegularExpressions;

namespace Domain.Models.ValueObjects
{
    public record Address
    {
        private static readonly Regex PostalCodePattern = new(@"^[A-Za-z0-9\s-]{1,20}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);

        public string Street { get; }
        public string City { get; }
        public string PostalCode { get; }
        public string Country { get; }

        private Address(string street, string city, string postalCode, string country)
        {
            Street = street;
            City = city;
            PostalCode = postalCode;
            Country = country;
        }

        /// <summary>
        /// Attempts to parse input in the format "Street|City|PostalCode|Country".
        /// Returns false when input is null/empty, malformed, or fails validation.
        /// </summary>
        public static bool TryParse(string? input, out Address address)
        {
            address = default!;

            if (string.IsNullOrWhiteSpace(input))
                return false;

            var parts = input.Split('|', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 4)
                return false;

            var street = parts[0].Trim();
            var city = parts[1].Trim();
            var postal = parts[2].Trim();
            var country = parts[3].Trim();

            if (string.IsNullOrWhiteSpace(street) ||
                string.IsNullOrWhiteSpace(city) ||
                string.IsNullOrWhiteSpace(postal) ||
                string.IsNullOrWhiteSpace(country))
            {
                return false;
            }

            if (postal.Length > 20)
                return false;

            if (!PostalCodePattern.IsMatch(postal))
                return false;

            address = new Address(street, city, postal, country);
            return true;
        }

        /// <summary>
        /// Parses input in the format "Street|City|PostalCode|Country" or throws <see cref="InvalidAddressException"/>.
        /// </summary>
        /// <exception cref="InvalidAddressException">Thrown when input is invalid.</exception>
        public static Address Parse(string? input)
        {
            if (TryParse(input, out var addr))
                return addr;

            throw new InvalidAddressException(input, "Address is invalid. Expected format: \"Street|City|PostalCode|Country\". PostalCode must match ^[A-Za-z0-9\\s-]{1,20}$.");
        }

        public override string ToString() => $"{Street}, {City}, {PostalCode}, {Country}";
    }

    public sealed class InvalidAddressException : ArgumentException
    {
        public string? AttemptedValue { get; }

        public InvalidAddressException()
            : base("Invalid Address.")
        {
        }

        public InvalidAddressException(string? attemptedValue)
            : base("Invalid Address.")
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidAddressException(string? attemptedValue, string message)
            : base(message)
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidAddressException(string? attemptedValue, string message, Exception innerException)
            : base(message, innerException)
        {
            AttemptedValue = attemptedValue;
        }
    }
}