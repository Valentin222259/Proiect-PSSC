using System;

namespace Domain.Exceptions
{
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