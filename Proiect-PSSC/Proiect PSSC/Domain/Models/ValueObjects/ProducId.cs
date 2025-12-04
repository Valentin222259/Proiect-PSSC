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

public sealed record ProductId
{
    private static readonly Regex ValidPattern = new(@"^[A-Za-z0-9_-]{1,50}$", RegexOptions.Compiled);

    public string Value { get; }

    private ProductId(string value) => Value = value;

    /// <summary>
    /// Parse the specified string into a <see cref="ProductId"/> or throw <see cref="InvalidProductIdException"/>.
    /// </summary>
    /// <exception cref="InvalidProductIdException">Thrown when the input is null, empty or does not match the required pattern.</exception>
    public static ProductId Parse(string? input)
    {
        if (TryParse(input, out var productId))
            return productId;

        throw new InvalidProductIdException(input, "ProductId is invalid. Must match pattern ^[A-Za-z0-9_-]{1,50}$.");
    }

    /// <summary>
    /// Attempts to parse the specified string into a <see cref="ProductId"/>.
    /// Returns false on null/empty or invalid format.
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

    public override string ToString() => Value;
}

/// <summary>
/// Exception thrown when a ProductId cannot be created due to invalid input.
/// </summary>
public sealed class InvalidProductIdException : ArgumentException
{
    public string? AttemptedValue { get; }

    public InvalidProductIdException()
    {
    }

    public InvalidProductIdException(string? attemptedValue)
        : base("Invalid ProductId.")
    {
        AttemptedValue = attemptedValue;
    }

    public InvalidProductIdException(string? attemptedValue, string message)
        : base(message)
    {
        AttemptedValue = attemptedValue;
    }

    public InvalidProductIdException(string? attemptedValue, string message, Exception innerException)
        : base(message, innerException)
    {
        AttemptedValue = attemptedValue;
    }
}