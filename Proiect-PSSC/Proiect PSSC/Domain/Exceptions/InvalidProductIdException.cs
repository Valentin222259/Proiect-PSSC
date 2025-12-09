using System;

namespace Domain.Exceptions
{
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
}