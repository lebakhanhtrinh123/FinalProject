using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Wallet
{
    public Guid WalletId { get; set; }

    public Guid? CustomerId { get; set; }

    public double? TotalPrice { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public DateTime? Status { get; set; }

    public virtual Customer? Customer { get; set; }

    public virtual ICollection<Refund> Refunds { get; set; } = new List<Refund>();
    public virtual ICollection<WithdrawMoney> WithdrawMoneys { get; set; } = new List<WithdrawMoney>();

}
