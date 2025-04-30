namespace BusinessObject.DTO.Auth;

public  class RegisterRequest
{
    public string? FullName { get; set; }

    public string? Address { get; set; }
    
    public string? Password { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public bool? Gender { get; set; }

    public DateTime? Birthday { get; set; }

    public string? IdentificationNumber { get; set; }

    public string? IdentificationFontOfPhoto { get; set; }

    public string? IdentificationBackOfPhoto { get; set; }
    
}
    