using Domain.Models.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Domain.Events
{
    public static class OrderPlacedEvent
    {
        public interface IOrderPlacedEvent { }

        public record OrderPlacedSucceededEvent : IOrderPlacedEvent
        {
            public string Csv { get; } 
            public DateTime PlacedDate { get; }
            public StockReservedOrder Order { get; }

            internal OrderPlacedSucceededEvent(StockReservedOrder order, DateTime placedDate)
            {
                Order = order;
                PlacedDate = placedDate;
                Csv = $"{order.CustomerId},{order.TotalAmount},{order.ReservationId}";
            }
        }

        public record OrderPlacedFailedEvent : IOrderPlacedEvent
        {
            public IEnumerable<string> Reasons { get; }

            internal OrderPlacedFailedEvent(IEnumerable<string> reasons)
            {
                Reasons = reasons;
            }
        }


        public static IOrderPlacedEvent ToEvent(this IOrder order) => order switch
        {

            StockReservedOrder stockReservedOrder => new OrderPlacedSucceededEvent(stockReservedOrder, DateTime.Now),


            InvalidOrder invalidOrder => new OrderPlacedFailedEvent(invalidOrder.Reasons),

            _ => new OrderPlacedFailedEvent(new[] { $"Unexpected state: {order.GetType().Name}" })
        };
    }
}