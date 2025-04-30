using BusinessObject.DTO.Auth;
using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Employee;
using BusinessObject.DTO.Response;

namespace Service.Interface;

public interface IAuthService
{
    Task<Result<LoginResponse>> Login(string email, string password);
     Task<Result<EmployeeResponse>> RegisterFlorist(RegisterRequest request );
     Task<Result<EmployeeResponse>> CreateCourierAccount(CreateCourierRequest request);
     Task<Result<string>> VerifyEmail(Guid id, string token);
    
}