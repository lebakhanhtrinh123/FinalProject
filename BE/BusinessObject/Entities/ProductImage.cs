using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class ProductImage
{
    public Guid ProductImageId { get; set; }

    public Guid? ProductId { get; set; }

    public string? ProductImage1 { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public bool? Status { get; set; }

    public virtual Product? Product { get; set; }
}
