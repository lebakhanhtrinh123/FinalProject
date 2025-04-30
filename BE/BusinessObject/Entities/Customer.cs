using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Customer
{
    public Guid CustomerId { get; set; }

    public string? Password { get; set; }

    public string? FullName { get; set; }

    public string? City { get; set; }

    public string? District { get; set; }

    public string? Address { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public bool? Gender { get; set; }

    public DateTime? Birthday { get; set; }

    public Guid? StoreId { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public string Status { get; set; }

    public string? Avatar { get; set; }

    public string? Otp { get; set; }

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Store? Store { get; set; }

    public virtual ICollection<Wallet> Wallets { get; set; } = new List<Wallet>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();

}
