using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Category
{
    public Guid CategoryId { get; set; }

    public string? CategoryName { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public bool? Status { get; set; }

    public virtual ICollection<Flower> Flowers { get; set; } = new List<Flower>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

}
