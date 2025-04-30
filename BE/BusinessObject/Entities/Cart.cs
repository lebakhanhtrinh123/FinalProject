using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public partial class Cart
    {
        public Guid CartId {  get; set; }
        public Guid? CustomerId { get; set; }
        public Guid? ProductId {  get; set; }
        public int? Quantity { get; set; }
        public Guid? StoreId { get; set; }
        public double? ProductTotalPrice { get; set; }
        public virtual Product? Product { get; set; }
        public virtual Customer? Customer { get; set; }


    }
}
