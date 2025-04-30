using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Employee;
using BusinessObject.Entities;

namespace Service.Interface;

public interface IEmployeeService
{
    Task<List<EmployeeResponse>> GetAllEmployee();
    Task<Result<EmployeeResponse>> GetEmployeeById(Guid id);
    Task<Result<EmployeeResponse>> UpdateEmployee(Guid id, UpdateEmployeeRequest request);
    Task<Result<Employee>> DeleteEmployee(Guid id);
    Task<Result<EmployeeResponse>> GetFloristWithStoreId(Guid storeid);
    Task<Result<EmployeeResponse>> GetCourierWithStoreId(Guid storeid);
}