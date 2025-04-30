using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Role
{
    public Guid RoleId { get; set; }

    public string? RoleName { get; set; }

    public bool? Status { get; set; }

    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
