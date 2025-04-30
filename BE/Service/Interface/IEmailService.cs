using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Email;

namespace Service.Interface;

public interface IEmailService
{
    Task SendEmail(SendEmailRequest request);
    Task<Result<string>> SendMailRegister(string email , string token);
}