using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.Cart
{
    public class CartResponse
    {
        public Guid CartId { get; set; }

        public Guid? ProductId { get; set; }

        public string? ProductName { get; set; }

        public Guid? CustomerId { get; set; }

        public int? Quantity { get; set; }
        public double? ProductPrice {  get; set; }
        public double? TotalPrice { get; set; }
        public string? ProductImage { get; set; }
    }
}
