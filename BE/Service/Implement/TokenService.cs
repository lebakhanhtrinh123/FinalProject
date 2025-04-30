using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BusinessObject.DTO.Commons;
using BusinessObject.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic.CompilerServices;
using Service.Interface;

namespace Service.Implement;

public class TokenService : ITokenService
{
    private const int SaltSize = 128 / 8;
    private const int KeySize = 256 / 8;
    private const int Iterations = 10000;
    private const char Delimiter = ';';
    private static readonly HashAlgorithmName _hashAlgorithmName = HashAlgorithmName.SHA256;
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    public string GenerateToken(object user)
    {
        var secretKey = _configuration["Jwt:Key"];
        var jwtTokenHandler = new JwtSecurityTokenHandler();
        var secretKeyByte = Encoding.UTF8.GetBytes(secretKey);

        var claims = new List<Claim>();

        if (user is Employee employee)
        {
            claims.AddRange(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, employee.FullName!),
                new Claim("Id", employee.EmployeeId.ToString()),
                new Claim(ClaimTypes.Role, employee.RoleId.ToString()),
                new Claim("FullName", employee.FullName!)
            });

            if (!string.IsNullOrEmpty(employee.Avatar))
            {
                claims.Add(new Claim("Avatar", employee.Avatar));
            }
            else
            {
                claims.Add(new Claim("Avatar", ""));
            }
        }
        else if (user is Customer customer)
        {
            claims.AddRange(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, customer.FullName!),
                new Claim("Id", customer.CustomerId.ToString()),
                new Claim(ClaimTypes.Role, RoleName.Customer.ToString()),
                new Claim("FullName", customer.FullName!)
            });

            if (!string.IsNullOrEmpty(customer.Avatar))
            {
                claims.Add(new Claim("Avatar", customer.Avatar));
            }
            else
            {
                claims.Add(new Claim("Avatar", ""));
            }
        }

        var tokenDescription = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(secretKeyByte),
                SecurityAlgorithms.HmacSha256)
        };

        var token = jwtTokenHandler.CreateToken(tokenDescription);
        return jwtTokenHandler.WriteToken(token);
    }
}