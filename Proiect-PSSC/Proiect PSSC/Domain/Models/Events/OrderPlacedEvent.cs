using CSharp.Choices; // Dacă folosești o librărie specifică, sau standard C#
using Domain.Models.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Domain.Events
{
    public static class OrderPlacedEvent
    {
        // Interfața marker pentru eveniment
        public interface IOrderPlacedEvent { }

        // Eveniment de succes - conține datele finale relevante (de ex. ID-ul comenzii, data, totalul)
        public record OrderPlacedSucceededEvent : IOrderPlacedEvent
        {
            public string Csv { get; } // Pentru export/raportare, similar cu exemplul de la lab
            public DateTime PlacedDate { get; }
            public StockReservedOrder Order { get; } // Putem expune starea finală validă

            internal OrderPlacedSucceededEvent(StockReservedOrder order, DateTime placedDate)
            {
                Order = order;
                PlacedDate = placedDate;
                Csv = $"{order.CustomerId},{order.TotalAmount},{order.ReservationId}";
            }
        }

        // Eveniment de eșec - conține motivele
        public record OrderPlacedFailedEvent : IOrderPlacedEvent
        {
            public IEnumerable<string> Reasons { get; }

            internal OrderPlacedFailedEvent(IEnumerable<string> reasons)
            {
                Reasons = reasons;
            }
        }

        // Metoda de extensie care convertește starea Entității în Eveniment
        // Aceasta este esența sarcinii 3.3
        public static IOrderPlacedEvent ToEvent(this IOrder order) => order switch
        {
            // Dacă am ajuns la starea de Stoc Rezervat, considerăm comanda plasată cu succes
            StockReservedOrder stockReservedOrder => new OrderPlacedSucceededEvent(stockReservedOrder, DateTime.Now),

            // Dacă este Invalid, returnăm evenimentul de eșec cu motivele
            InvalidOrder invalidOrder => new OrderPlacedFailedEvent(invalidOrder.Reasons),

            // Orice altă stare intermediară (Unvalidated, Validated dar nerezervat) este un eșec neașteptat în acest punct
            _ => new OrderPlacedFailedEvent(new[] { $"Unexpected state: {order.GetType().Name}" })
        };
    }
}