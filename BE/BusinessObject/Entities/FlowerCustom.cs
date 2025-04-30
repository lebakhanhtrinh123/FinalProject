using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class FlowerCustom
{
    public Guid FlowerCustomId { get; set; }

    public Guid? FlowerId { get; set; }

    public Guid? ProductCustomId { get; set; }

    public int? Quantity { get; set; }

    public double? Price { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public bool? Status { get; set; }

    public virtual Flower? Flower { get; set; }

    public virtual ProductCustom? ProductCustom { get; set; }
}
