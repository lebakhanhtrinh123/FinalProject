namespace BusinessObject.DTO.Category;

public class CategoryResponse
{
    public Guid CategoryId { get; set; }

    public string? CategoryName { get; set; }
    public bool? Status { get; set; }

}