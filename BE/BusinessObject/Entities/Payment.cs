using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Payment
{
    public Guid PaymentId { get; set; }

    public Guid? OrderId { get; set; }

    public string? Method { get; set; }

    public Guid? StoreId { get; set; }

    public Guid? CustomerId { get; set; }

    public double? TotalPrice { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public bool? Status { get; set; }

    public virtual Customer? Customer { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Store? Store { get; set; }
}
