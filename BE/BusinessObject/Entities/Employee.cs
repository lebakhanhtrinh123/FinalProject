using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Employee
{
    public Guid EmployeeId { get; set; }

    public string? Password { get; set; }

    public string? FullName { get; set; }

    public string? Address { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public bool? Gender { get; set; }

    public DateTime? Birthday { get; set; }

    public string? IdentificationNumber { get; set; }

    public string? IdentificationFontOfPhoto { get; set; }

    public string? IdentificationBackOfPhoto { get; set; }
    
    public string? NumberMoto { get; set; }
    
    public string? ColorMoto {  get; set; }
    
    public string? MotoType { get; set; }   

    public Guid? RoleId { get; set; }

    public Guid? StoreId { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public bool? Status { get; set; }

    public string? Avatar { get; set; }

    public string? Otp { get; set; }

    public virtual ICollection<Delivery> Deliveries { get; set; } = new List<Delivery>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual Role? Role { get; set; }

    public virtual Store? Store { get; set; }
}
