using BusinessObject.DTO.Commons;

namespace BusinessObject.DTO.Auth;

public class LoginResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string? AccessToken { get; set; }
    
    public string? RoleName { get; set; }
}