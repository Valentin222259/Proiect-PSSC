namespace Proiect_PSSC.DTOs
{
    public class AddressDto
    {
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;

        /// <summary>
        /// Converts the AddressDto to the pipe-delimited format expected by Address.Parse()
        /// Format: "Street|City|PostalCode|Country"
        /// </summary>
        public string ToAddressString()
        {
            return $"{Street}|{City}|{PostalCode}|{Country}";
        }
    }
}