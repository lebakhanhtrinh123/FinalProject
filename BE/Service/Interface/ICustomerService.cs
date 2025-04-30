using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Customer;
using BusinessObject.Entities;

namespace Service.Interface;

public interface ICustomerService
{
    Task<List<CustomerResponse>> GetAllCustomer();
    Task<Result<CustomerResponse>> GetCustomerById(Guid id);
    Task<Result<CustomerResponse>> UpdateCustomer(Guid id, UpdateCustomerRequest request);
    Task<Result<Customer>> DeleteCustomer(Guid id);
    Task<Result<CustomerResponse>> RegisterCustomer(CreateCustomerRequest request );
}