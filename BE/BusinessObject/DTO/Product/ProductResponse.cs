using BusinessObject.DTO.ProductImages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.Product
{
    public class ProductResponse
    {
        public Guid ProductId { get; set; }

        public string? ProductName { get; set; }

        public Guid? StoreId { get; set; }

        public int? Quantity { get; set; }

        public double? Price { get; set; }

        public DateTime? CreateAt { get; set; }

        public DateTime? UpdateAt { get; set; }

        public string? Size { get; set; }

        public double? Discount { get; set; }

        public string? Description { get; set; }

        public bool? Featured { get; set; }

        public string? CategoryName { get; set; }

        public int? Sold { get; set; }

        public bool? Status { get; set; }
        public List<ProductImagesResponse>? ProductImages { get; set; }

    }
}
