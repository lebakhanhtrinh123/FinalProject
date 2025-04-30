using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Feedback
{
    public Guid FeedbackId { get; set; }

    public Guid? CustomerId { get; set; }

    public Guid? OrderId { get; set; }

    public string? Descripstion { get; set; }

    public int? Rating { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public string? Status { get; set; }

    public virtual Customer? Customer { get; set; }

    public virtual Order? Order { get; set; }
}
