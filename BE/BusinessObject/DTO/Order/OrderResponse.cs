using BusinessObject.DTO.OrderDetails;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.Order
{
    public class OrderResponse
    {
        public Guid OrderId { get; set; }

        public double? OrderPrice { get; set; }

        public Guid? ProductCustomId { get; set; }

        public Guid? CustomerId { get; set; }

        public Guid? StaffId { get; set; }

        public Guid? PromotionId { get; set; }
        public string? PromotionName { get; set; }

        public double? PromotionDiscount { get; set; }

        public string? DeliveryDistrict { get; set; }
        public string? DeliveryCity { get; set; }

        public string? DeliveryAddress { get; set; }

        public Guid? StoreId { get; set; }

        public string? Note { get; set; }

        public DateTime? DeliveryDateTime { get; set; }

        public string? Phone { get; set; }

        public bool? Transfer { get; set; }

        public bool? Refund { get; set; }

        public DateTime? CreateAt { get; set; }

        public DateTime? UpdateAt { get; set; }

        public string? Status { get; set; }
        public List<OrderDetailsResponse>? OrderDetails { get; set; }
    }
}
