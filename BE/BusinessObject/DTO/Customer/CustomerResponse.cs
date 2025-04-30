namespace BusinessObject.DTO.Customer;

public class CustomerResponse
{
    public Guid CustomerId { get; set; }
    
    public string? FullName { get; set; }

    public string? City { get; set; }

    public string? Distrist { get; set; }

    public string? Address { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public bool? Gender { get; set; }

    public DateTime? Birthday { get; set; }

    public Guid? StoreId { get; set; }
    
    public string Status { get; set; }

    public string? Avatar { get; set; }

    public string? Otp { get; set; }
}