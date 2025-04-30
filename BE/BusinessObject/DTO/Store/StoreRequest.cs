using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTO.Request
{
    public class StoreRequest
    {
        public string? StoreName { get; set; }
        public string? City { get; set; }

        public string? District { get; set; }

        public string? Address { get; set; }

        public string? StorePhone { get; set; }

        public string? StoreAvatar { get; set; }
        public string? StoreEmail { get; set; }
        public bool? Status { get; set; }
    }
}
