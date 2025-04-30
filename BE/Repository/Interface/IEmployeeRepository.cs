using BusinessObject.Entities;

namespace Repository.Interface;

public interface IEmployeeRepository
{
    string? GetAdminAccount(string email, string password);
    Task<List<Employee?>> GetAllEmployees();
    Task<Employee?> GetEmployeeByEmail(string email);
    Task<Employee?> GetEmployeesById(Guid id);
    Task<Employee?> UpdateEmployee(Employee? employee);
    Task<Employee?> Register(Employee? employee);
    Task<Employee?> DeleteEmployee(Guid id);
    Task<Employee?> FindEmployeeByPhone(string phone);
    Task<Employee?> FindEmployeeByEmail(string email);
    Task<Employee?> GetFloristWithStoreId(Guid storeid , string rolename);
    Task<Employee?> GetCourierWithStoreId(Guid storeid , string rolename);
}