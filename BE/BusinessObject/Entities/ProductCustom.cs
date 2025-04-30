using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class ProductCustom
{
    public Guid ProductCustomId { get; set; }

    public string? ProductName { get; set; }

    public Guid? FlowerBasketId { get; set; }

    public int? Quantity { get; set; }

    public Guid? CustomerId { get; set; }

    public double? TotalPrice { get; set; }

    public string? Description { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public bool? Status { get; set; }

    public virtual FlowerBasket? FlowerBasket { get; set; }

    public virtual ICollection<FlowerCustom> FlowerCustoms { get; set; } = new List<FlowerCustom>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
