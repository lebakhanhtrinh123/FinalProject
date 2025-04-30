namespace BusinessObject.DTO.FeedBack;

public class CreateFeedbackRequest
{
    public Guid? OrderId { get; set; }

    public string? Descripstion { get; set; }

    public int? Rating { get; set; }
}