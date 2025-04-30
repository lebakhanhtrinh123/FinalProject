using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.Delivery
{
    public class UpdateDeliveryByShipperResponse
    {
        public DateTime? TimeDone { get; set; }
        public string? DeliveryImage { get; set; }
        public string? Status { get; set; }

    }
}
