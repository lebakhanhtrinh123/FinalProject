using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Flower
{
    public Guid FlowerId { get; set; }

    public string? FlowerName { get; set; }

    public double? Price { get; set; }

    public Guid? StoreId { get; set; }

    public string? Image { get; set; }

    public int? Quantity { get; set; }

    public Guid? CategoryId { get; set; }

    public string? Description { get; set; }

    public int? Sold { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public bool? Status { get; set; }

    public virtual Category? Category { get; set; }

    public virtual ICollection<FlowerCustom> FlowerCustoms { get; set; } = new List<FlowerCustom>();

    public virtual Store? Store { get; set; }
}
