using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Delivery
{
    public Guid DeliveryId { get; set; }

    public Guid? OrderId { get; set; }

    public Guid? ShipperId { get; set; }

    public bool? FreeShip { get; set; }

    public double? Fee { get; set; }

    public string? PickupLocation { get; set; }
    public string? CustomerName {  get; set; }
    public string? CustomerPhone { get; set; }
    public string? DeliveryLocation { get; set; }
    public DateTime? DeliveryTime { get; set; }
    public DateTime? TimeDone { get; set; }
    public string? DeliveryImage {  get; set; }

    public string? Status { get; set; }
    public string? note { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Employee? Shipper { get; set; }
}
