using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Store
{
    public Guid StoreId { get; set; }

    public string? StoreName { get; set; }

    public string? City { get; set; }

    public string? District { get; set; }

    public string? Address { get; set; }

    public bool? Status { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public string? StorePhone { get; set; }

    public string? StoreAvatar { get; set; }

    public string? StoreEmail { get; set; }

    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();

    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();

    public virtual ICollection<FlowerBasket> FlowerBaskets { get; set; } = new List<FlowerBasket>();

    public virtual ICollection<Flower> Flowers { get; set; } = new List<Flower>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
