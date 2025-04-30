using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.ProductImages
{
    public class ProductImagesResponse
    {
        public Guid ProductImageId { get; set; }

        public string? ProductImage1 { get; set; }
        public DateTime? CreateAt { get; set; }

        public DateTime? UpdateAt { get; set; }

        public bool? Status { get; set; }
    }
}
