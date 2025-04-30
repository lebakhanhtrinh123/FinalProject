using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.Product
{
    public class UpdateProductRequest
    {
        public string? ProductName { get; set; }
        public int? Quantity { get; set; }
        public double? Price { get; set; }
        public string? Size { get; set; }

        public double? Discount { get; set; }

        public string? Description { get; set; }

        public bool? Featured { get; set; }
        public Guid? CategoryId { get; set; }
        public bool? Status { get; set; }
    }
}
