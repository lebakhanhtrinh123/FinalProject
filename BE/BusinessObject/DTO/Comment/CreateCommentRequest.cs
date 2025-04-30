namespace BusinessObject.DTO.Comment;

public class CreateCommentRequest
{
    public Guid? ProductId { get; set; }

    public Guid? CustomerId { get; set; }

    public int? Rating { get; set; }

    public string? Feedback { get; set; }
    
    public bool? Status { get; set; }
}