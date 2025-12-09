using System;

namespace Domain.Exceptions
{
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