using System;

namespace Domain.Exceptions
{
    public sealed class InvalidOrderException : ArgumentException
    {
        public string? AttemptedValue { get; }

        public InvalidOrderException()
            : base("Invalid Order.")
        {
        }

        public InvalidOrderException(string? attemptedValue)
            : base("Invalid Order.")
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidOrderException(string? attemptedValue, string message)
            : base(message)
        {
            AttemptedValue = attemptedValue;
        }

        public InvalidOrderException(string? attemptedValue, string message, Exception innerException)
            : base(message, innerException)
        {
            AttemptedValue = attemptedValue;
        }
    }
}