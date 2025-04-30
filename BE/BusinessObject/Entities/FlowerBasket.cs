using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class FlowerBasket
{
    public Guid FlowerBasketId { get; set; }

    public string? FlowerBasketName { get; set; }

    public double? Price { get; set; }

    public Guid? StoreId { get; set; }

    public string? Image { get; set; }

    public int? Quantity { get; set; }

    public string? Decription { get; set; }

    public bool? Feature { get; set; }

    public int? Sold { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public bool? Status { get; set; }

    public virtual ICollection<ProductCustom> ProductCustoms { get; set; } = new List<ProductCustom>();

    public virtual Store? Store { get; set; }
}
