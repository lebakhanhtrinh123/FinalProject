using System;
using System.Collections.Generic;

namespace BusinessObject.Entities;

public partial class Comment
{
    public Guid CommentId { get; set; }

    public Guid? ProductId { get; set; }

    public Guid? CustomerId { get; set; }

    public int? Rating { get; set; }

    public string? Feedback { get; set; }

    public bool? Status { get; set; }
    public virtual Customer? Customer { get; set; } 
    public virtual Product? Product { get; set; }    
}
