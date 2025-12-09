using System;

namespace Domain.Exceptions
{
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