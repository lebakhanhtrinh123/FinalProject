using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Promotion
{
    public Guid PromotionId { get; set; }

    public string? PromotionName { get; set; }

    public int? Quantity { get; set; }

    public double? PromotionDiscount { get; set; }

    public string? PromotionCode { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public bool? Status { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
