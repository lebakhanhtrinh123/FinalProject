using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.OrderDetails
{
    public  class OrderDetailsResponse
    {
        public Guid OrderDetailId { get; set; }

        public Guid? ProductId { get; set; }

        public string? ProductName { get; set; } 

        public string? ProductImage {  get; set; }
        public double? Price { get; set; }
        public double? Discount { get; set; }
        public double? ProductTotalPrice { get; set; }

        public int? Quantity { get; set; }

        public Guid? OrderId { get; set; }

        public DateTime? CreateAt { get; set; }

        public DateTime? UpdateAt { get; set; }

        public bool? Status { get; set; }
    }
}
