namespace BusinessObject.DTO.Customer;

public class UpdateCustomerRequest
{
    public string? City { get; set; }

    public string? Distrist { get; set; }

    public string? Address { get; set; }
    
    public string? Phone { get; set; }
    
    public DateTime? Birthday { get; set; }
    
    public string Status { get; set; }

    public string? Avatar { get; set; }
}