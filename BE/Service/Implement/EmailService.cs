using System.Text;
using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Email;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MimeKit.Text;
using Repository.Interface;
using Service.Interface;

namespace Service.Implement;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ICustomerRepository _customerRepository;

    public EmailService(IConfiguration configuration , ICustomerRepository customerRepository)
    {
        _configuration = configuration;
        _customerRepository = customerRepository;
    }
    public async Task SendEmail(SendEmailRequest request)
    {
        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(_configuration.GetSection("MailSettings:Mail").Value));
        email.To.Add(MailboxAddress.Parse(request.To));
        email.Subject = request.Subject;
        email.Body = new TextPart(TextFormat.Html) { Text = request.Body };


        // dùng SmtpClient của MailKit
        using var smtp = new SmtpClient();
            
        await smtp.ConnectAsync(_configuration.GetSection("MailSettings:Host").Value, 587,
            SecureSocketOptions.Auto);
        await smtp.AuthenticateAsync(_configuration.GetSection("MailSettings:Mail").Value,
            _configuration.GetSection("MailSettings:Password").Value);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
    public string GetEmailTemplate(string templateName)
    {
        // string pathLocal = Path.Combine("C:\\FPT_University_FULL\\CAPSTONE_API\\Services\\MailTemplate\\", $"{templateName}.html");*/
        string path = Path.Combine(_configuration.GetSection("EmailTemplateDirectory").Value!,
            $"{templateName}.html");
        var template = File.ReadAllText(path, Encoding.UTF8);
        template = template.Replace("[path]", _configuration.GetSection("RedirectUrl").Value);
        return template;
    }

    public async Task<Result<string>> SendMailRegister(string email , string token)
    {
        var response = new Result<string>();
        var user = await _customerRepository.FindCustomerByEmail(email);
        string appDomain = _configuration.GetSection("MailSettings:AppDomain").Value;
        string confirmationLink = _configuration.GetSection("MailSettings:EmailConfirmation").Value;
        string formattedLink = string.Format(appDomain + confirmationLink, user.CustomerId , token);

         var template = GetEmailTemplate("VerifyAccountEmail");
         template = template.Replace($"[link]", formattedLink);

        SendEmailRequest content = new SendEmailRequest
        {
            To = email,
            Subject = "[CUSTOMEFLOWERCHAIN] Verify Account",
            Body =  template,
        };
        await SendEmail(content);
        // response.Messages = [""];
        response.ResultStatus = ResultStatus.Success.ToString();
        return response;
    }
}