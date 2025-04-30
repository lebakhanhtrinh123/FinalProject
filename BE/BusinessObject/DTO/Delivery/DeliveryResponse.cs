using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.Delivery
{
    public class DeliveryResponse
    {
        public Guid DeliveryId { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? ShipperId { get; set; }
        public bool? FreeShip { get; set; }
        public double? Fee { get; set; }
        public string? Note { get; set; }

        public string? PickupLocation { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? DeliveryLocation { get; set; }
        public DateTime? DeliveryTime { get; set; }
        public DateTime? TimeDone { get; set; }
        public string? DeliveryImage { get; set; }
        public string? Status { get; set; }
    }
}
