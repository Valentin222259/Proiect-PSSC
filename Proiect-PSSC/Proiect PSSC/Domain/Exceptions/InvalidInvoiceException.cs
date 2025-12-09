using System;

namespace Domain.Exceptions
{
    public sealed class InvalidInvoiceException : ArgumentException
    {
        public string? AttemptedValue { get; }

        public InvalidInvoiceException()
            : base("Invalid Invoice.")
        {
        }

        public InvalidInvoiceException(string? attemptedValue)
            : base("Invalid Invoice.")
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidInvoiceException(string? attemptedValue, string message)
            : base(message)
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidInvoiceException(string? attemptedValue, string message, Exception innerException)
            : base(message, innerException)
        {
            AttemptedValue = attemptedValue;
        }
    }
}