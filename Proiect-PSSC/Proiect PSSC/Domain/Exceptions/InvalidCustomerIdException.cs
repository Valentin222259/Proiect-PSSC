using System;

namespace Domain.Exceptions
{
    public sealed class InvalidCustomerIdException : ArgumentException
    {
        public string? AttemptedValue { get; }

        public InvalidCustomerIdException()
            : base("Invalid CustomerId.")
        {
        }

        public InvalidCustomerIdException(string? attemptedValue)
            : base("Invalid CustomerId.")
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidCustomerIdException(string? attemptedValue, string message)
            : base(message)
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidCustomerIdException(string? attemptedValue, string message, Exception innerException)
            : base(message, innerException)
        {
            AttemptedValue = attemptedValue;
        }
    }
}