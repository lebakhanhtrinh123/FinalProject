using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.Role
{
    public class RoleResponse
    {
        public Guid RoleId { get; set; }

        public string? RoleName { get; set; }

        public bool? Status { get; set; }
    }
}
