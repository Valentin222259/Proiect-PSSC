using System;

namespace Domain.Exceptions
{
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