using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Refund
{
    public Guid RefundId { get; set; }

    public Guid? OrderId { get; set; }

    public double? Price { get; set; }

    public Guid? WallerId { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public string? Status { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Wallet? Waller { get; set; }

}
