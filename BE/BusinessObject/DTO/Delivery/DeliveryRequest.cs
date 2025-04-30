using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.Delivery
{
    public class DeliveryRequest
    {
        public bool? FreeShip { get; set; }
        public double? Fee { get; set; }
        public string? PickupLocation { get; set; }
        public Guid? ShipperId { get; set; }
        public string? note { get; set; }

    }
}
