using System.Linq.Expressions;
using BusinessObject.Entities;

namespace Repository.Interface;

public interface ICustomerRepository
{
    Task<List<Customer?>> GetAllCustomer();
    Task<Customer?> GetCustomerById(Guid id);
    Task<Customer?> RegisterCustomer(Customer customer);
    Task<Customer?> UpdateCustomer(Customer customer);
    Task<Customer?> DeleteMember(Guid id);
    string CreateRandomToken();
    Task<Customer?> FindCustomerByPhone(string phone);
    Task<Customer?> FindCustomerByEmail(string email);
    Task<Customer?> FindOne(Expression<Func<Customer, bool>> predicate);
}