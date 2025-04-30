using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class WithdrawMoney
{
    public Guid WithdrawMoneyId { get; set; }

    public Guid? WalletId { get; set; }

    public double? Price { get; set; }

    public string? BankAccountName { get; set; }

    public string? BankName { get; set; }

    public string? BankNumber { get; set; }

    public string? Otp { get; set; }

    public string? Reason { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? Status { get; set; }

    public virtual Wallet? Wallet { get; set; }
}
