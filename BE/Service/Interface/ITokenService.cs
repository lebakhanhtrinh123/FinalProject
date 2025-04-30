using System.Security.Claims;
using BusinessObject.Entities;

namespace Service.Interface;

public interface ITokenService
{
   public string GenerateToken(object user);
}