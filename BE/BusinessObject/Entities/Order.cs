 using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Order
{
    public Guid OrderId { get; set; }

    public double? OrderPrice { get; set; }

    public Guid? ProductCustomId { get; set; }

    public Guid? CustomerId { get; set; }

    public Guid? StaffId { get; set; }

    public Guid? PromotionId { get; set; }
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

    public virtual Customer? Customer { get; set; }

    public virtual ICollection<Delivery> Deliveries { get; set; } = new List<Delivery>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ProductCustom? ProductCustom { get; set; }

    public virtual Promotion? Promotion { get; set; }

    public virtual ICollection<Refund> Refunds { get; set; } = new List<Refund>();

    public virtual Employee? Staff { get; set; }
}
