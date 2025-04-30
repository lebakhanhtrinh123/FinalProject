using System.Security.Cryptography;
using AutoMapper;
using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Customer;
using BusinessObject.Entities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Repository.Interface;
using Service.Interface;

namespace Service.Implement;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IMapper _mapper;
    private readonly IRoleRepository _roleRepository;
    private readonly IConfiguration _configuration;
    private readonly IMemoryCache _cache;
    private readonly string tempdata = "tempdatakey";
    private readonly IEmailService _emailService;

    public CustomerService(ICustomerRepository customerRepository, IMapper mapper, IRoleRepository roleRepository , IEmailService emailService, IMemoryCache memoryCache
    , IConfiguration configuration)
    {
        _customerRepository = customerRepository;
        _mapper = mapper;
        _cache = memoryCache;
        _roleRepository = roleRepository;
        _emailService = emailService;
        _configuration = configuration;

    }
    public async Task<Result<CustomerResponse>> RegisterCustomer(CreateCustomerRequest request)
    {
        var isMailUsed = await _customerRepository.FindCustomerByEmail(request.Email);
        var response = new Result<CustomerResponse>();

        if (isMailUsed != null)
        {
            response.Messages = new[] { "This mail is already used" };
            response.ResultStatus = ResultStatus.Duplicated.ToString();
            return response;
        }
        CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);
        Customer customer = new Customer
        {
            Email = request.Email,
            Password = Convert.ToBase64String(passwordHash),
            Status = CustomerStatus.NotVerified.ToString(),
        };
        var user = await _customerRepository.RegisterCustomer(customer);
        var token = _customerRepository.CreateRandomToken();
        var cacheEntryOption = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromMinutes(10))
            .SetPriority(CacheItemPriority.Normal);
        _cache.Set(tempdata, token, cacheEntryOption);
        var mail = await _emailService.SendMailRegister(customer.Email, token);
        if (mail.ResultStatus != ResultStatus.Success.ToString())
        {
            response.Messages = new[] { "Failed to send confirmation email." };
            response.ResultStatus = ResultStatus.Failed.ToString();
            return response;
        }
        response.RoleName = RoleName.Customer.ToString();
        response.ResultStatus = ResultStatus.Success.ToString();
        response.Messages = new []{"Register successfully!"};
        response.Data = _mapper.Map<CustomerResponse>(user);
        return response;
    }
    public async Task<List<CustomerResponse>> GetAllCustomer()
    {
        var list = await _customerRepository.GetAllCustomer();
        return _mapper.Map<List<CustomerResponse>>(list);
    }

    public async Task<Result<CustomerResponse>> GetCustomerById(Guid id)
    {
        var response = new Result<CustomerResponse>();
        var customer = await _customerRepository.GetCustomerById(id);
        if (customer == null)
        {
            response.Messages = ["Customer not found!"];
            response.ResultStatus = ResultStatus.NotFound.ToString();
            return response;
        }
        else
        {
            response.Data = _mapper.Map<CustomerResponse>(customer);
            response.Messages = ["Successfully!"];
            response.ResultStatus = ResultStatus.Success.ToString();
            return response;
        }
    }

   public async Task<Result<CustomerResponse>> UpdateCustomer(Guid id, UpdateCustomerRequest request)
{
    var response = new Result<CustomerResponse>();
    var customer = await _customerRepository.GetCustomerById(id);
    if (customer == null)
    {
        response.Messages = new[] { "Customer is not found!" };
        response.ResultStatus = ResultStatus.NotFound.ToString();
        return response;
    }
    if (request.Phone == customer.Phone &&
        request.City == customer.City &&
        request.Distrist == customer.District &&
        request.Address == customer.Address &&
        request.Birthday == customer.Birthday &&
        request.Status == customer.Status &&
        request.Avatar == customer.Avatar)
    {
        response.Data = _mapper.Map<CustomerResponse>(customer);
        response.Messages = new[] { "Nothing changed!" };
        response.ResultStatus = ResultStatus.Error.ToString();
        return response;
    }
    if (!string.IsNullOrEmpty(request.Phone) && request.Phone != customer.Phone)
    {
        var isPhoneExisted = await _customerRepository.FindCustomerByPhone(request.Phone);
        if (isPhoneExisted != null)
        {
            response.Messages = new[] { "This phone number is already existed!" };
            response.ResultStatus = ResultStatus.Error.ToString();
            return response;
        }
    }
    customer.City = request.City ?? customer.City;
    customer.District = request.Distrist ?? customer.District;
    customer.Address = request.Address ?? customer.Address;
    customer.Phone = request.Phone ?? customer.Phone;
    customer.Birthday = request.Birthday ?? customer.Birthday;
    customer.Status = request.Status ?? customer.Status;
    customer.Avatar = request.Avatar ?? customer.Avatar;
    await _customerRepository.UpdateCustomer(customer);
    response.Data = _mapper.Map<CustomerResponse>(customer);
    response.Messages = new[] { "Update successfully!" };
    response.ResultStatus = ResultStatus.Success.ToString();
    return response;
}


    public async Task<Result<Customer>> DeleteCustomer(Guid id)
    {
        var customer = await _customerRepository.GetCustomerById(id);
    
        if (customer == null)
        {
            return new Result<Customer>
            {
                ResultStatus = ResultStatus.NotFound.ToString(),
                Messages = new []{"Customer not found."}
            };
        }

        await _customerRepository.DeleteMember(id);

        return new Result<Customer>
        {
            ResultStatus = ResultStatus.Success.ToString(),
            Messages = new []{"Customer deleted successfully."}
        };
    }
    private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        using (var hmac = new HMACSHA512())
        {
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        }
    }
}