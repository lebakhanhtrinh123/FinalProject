using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.OrderDetails
{
    public class OrderDetailsRequest
    {
        public Guid ProductId { get; set; }
        public int? Quantity { get; set; }

    }
}
