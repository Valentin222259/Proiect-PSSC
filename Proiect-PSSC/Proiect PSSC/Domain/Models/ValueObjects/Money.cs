// Create Money value object following the pattern from copilot-instructions.md
//
// Requirements:
// - Record type with immutability
// - Private constructor with validation
// - Static TryParse method for safe parsing from string
// - Properties: decimal Amount, string Currency
// - Validation: Amount >= 0, Currency is 3-letter ISO code (USD, EUR, RON, etc.)
// - Pattern for Currency: ^[A-Z]{3}$
// - Override ToString() for serialization (format: "123.45 USD")
// - Throw InvalidMoneyException on invalid input
//
// Example valid Money: "100.50 USD", "250.00 EUR", "1500.00 RON"
using System;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Domain.Models.ValueObjects
{
    public record Money
    {
        private static readonly Regex CurrencyPattern = new(@"^[A-Z]{3}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);

        public decimal Amount { get; }
        public string Currency { get; }

        private Money(decimal amount, string currency)
        {
            Amount = amount;
            Currency = currency;
        }

        /// <summary>
        /// Creates a new Money instance after validating inputs.
        /// Throws <see cref="InvalidMoneyException"/> on invalid input.
        /// </summary>
        public static Money Create(decimal amount, string currency)
        {
            if (!TryCreate(amount, currency, out var money))
                throw new InvalidMoneyException($"{amount} {currency}", "Invalid Money. Amount must be >= 0 and Currency must be a 3-letter uppercase ISO code.");

            return money;
        }

        /// <summary>
        /// Attempts to create a Money instance from components without throwing.
        /// </summary>
        public static bool TryCreate(decimal amount, string? currency, out Money money)
        {
            money = default!;

            if (amount < 0m)
                return false;

            if (string.IsNullOrWhiteSpace(currency))
                return false;

            var code = currency.Trim().ToUpperInvariant();

            if (!CurrencyPattern.IsMatch(code))
                return false;

            money = new Money(amount, code);
            return true;
        }

        /// <summary>
        /// Attempts to parse a textual representation like "123.45 USD" into Money without throwing.
        /// </summary>
        public static bool TryParse(string? input, out Money money)
        {
            money = default!;

            if (string.IsNullOrWhiteSpace(input))
                return false;

            var parts = input.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 2)
                return false;

            if (!decimal.TryParse(parts[0], NumberStyles.Number, CultureInfo.InvariantCulture, out var amount))
                return false;

            var currency = parts[1].Trim();

            return TryCreate(amount, currency, out money);
        }

        /// <summary>
        /// Parses a textual representation like "123.45 USD" into Money or throws <see cref="InvalidMoneyException"/>.
        /// </summary>
        public static Money Parse(string? input)
        {
            if (TryParse(input, out var m))
                return m;

            throw new InvalidMoneyException(input, "Invalid Money format. Expected format: \"123.45 USD\" with a non-negative amount and 3-letter uppercase currency code.");
        }

        public override string ToString() => $"{Amount.ToString("F2", CultureInfo.InvariantCulture)} {Currency}";
    }

    public sealed class InvalidMoneyException : ArgumentException
    {
        public string? AttemptedValue { get; }

        public InvalidMoneyException()
            : base("Invalid Money.")
        {
        }

        public InvalidMoneyException(string? attemptedValue)
            : base("Invalid Money.")
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidMoneyException(string? attemptedValue, string message)
            : base(message)
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidMoneyException(string? attemptedValue, string message, Exception innerException)
            : base(message, innerException)
        {
            AttemptedValue = attemptedValue;
        }
    }
}