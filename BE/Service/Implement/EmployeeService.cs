using AutoMapper;
using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Employee;
using BusinessObject.Entities;
using Repository.Interface;
using Service.Interface;

namespace Service.Implement;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IMapper _mapper;
    private readonly IRoleRepository _roleRepository;
    
    public EmployeeService(IEmployeeRepository employeeRepository , IMapper mapper , IRoleRepository roleRepository)
    {
        _employeeRepository = employeeRepository;
        _mapper = mapper;
        _roleRepository = roleRepository;
    }
    public async Task<List<EmployeeResponse>> GetAllEmployee()
    {
        var list = await _employeeRepository.GetAllEmployees();
        return _mapper.Map<List<EmployeeResponse>>(list);
    }

    public async Task<Result<EmployeeResponse>> GetEmployeeById(Guid id)
    {
        var response = new Result<EmployeeResponse>();
        var user = await _employeeRepository.GetEmployeesById(id);
        if (user == null)
        {
            response.Messages = ["Employee not found!"];
            response.ResultStatus = ResultStatus.NotFound.ToString();
            return response;
        }
        else
        {
            response.Data = _mapper.Map<EmployeeResponse>(user);
            response.Messages = ["Successfully!"];
            response.ResultStatus = ResultStatus.Success.ToString();
            return response;
        }
    }

    public async Task<Result<EmployeeResponse>> UpdateEmployee(Guid id, UpdateEmployeeRequest request)
    {
        var response = new Result<EmployeeResponse>();
        var employee = await _employeeRepository.GetEmployeesById(id);
        if (employee == null)
        {
            response.Messages = ["User is not found!"];
            response.ResultStatus = ResultStatus.NotFound.ToString();
            return response;
        }
        else if (request.Phone.Equals(employee.Phone) && request.FullName.Equals(employee.FullName))
        {
            response.Data = _mapper.Map<EmployeeResponse>(employee);
            response.Messages = ["Nothing change!"];
            response.ResultStatus = ResultStatus.Error.ToString();
            return response;
        }

        var isPhoneExisted = await _employeeRepository.FindEmployeeByPhone(request.Phone);
        if (isPhoneExisted != null)
        {
            response.Messages = new[] { "This is already existed" };
            response.ResultStatus = ResultStatus.Error.ToString();
            return response;
        }
        var newemployee = _mapper.Map(request, employee);
        response.Data = _mapper.Map<EmployeeResponse>(await _employeeRepository.UpdateEmployee(newemployee));
        response.Messages = ["Update successfully"];
        response.ResultStatus = ResultStatus.Success.ToString();
        return response;
    }

    public async Task<Result<Employee>> DeleteEmployee(Guid id)
    {
        var employee = await _employeeRepository.GetEmployeesById(id);
    
        if (employee == null)
        {
            return new Result<Employee>
            {
                ResultStatus = ResultStatus.NotFound.ToString(),
                Messages = new []{"Employee not found."}
            };
        }

        await _employeeRepository.DeleteEmployee(id);

        return new Result<Employee>
        {
            ResultStatus = ResultStatus.Success.ToString(),
            Messages = new []{"Employee deleted successfully."}
        };
    }

    public async Task<Result<EmployeeResponse>> GetFloristWithStoreId(Guid storeId)
    {
        var response = new Result<EmployeeResponse>();
        var employee = await _employeeRepository.GetFloristWithStoreId(storeId, RoleName.Florist.ToString());
        if (employee == null)
        {
            response.Messages = new[] { "Florist is not found!" };
            response.ResultStatus = ResultStatus.NotFound.ToString();
            return response;
        }
        if (employee.Role == null || employee.Role.RoleName != RoleName.Florist.ToString())
        {
            response.Messages = new[] { "Employee does not have the Florist role!" };
            response.ResultStatus = ResultStatus.Invalid.ToString();
            return response;
        }

        response.RoleName = RoleName.Florist.ToString();
        response.Data = _mapper.Map<EmployeeResponse>(employee);
        response.Messages = new[] { "Successfully!" };
        response.ResultStatus = ResultStatus.Success.ToString();

        return response;
    }


    public async Task<Result<EmployeeResponse>> GetCourierWithStoreId(Guid storeid)
    {
        var response = new Result<EmployeeResponse>();
        var employee = await _employeeRepository.GetFloristWithStoreId(storeid, RoleName.Courier.ToString());
        if (employee == null)
        {
            response.Messages = new[] { "Courier is not found!" };
            response.ResultStatus = ResultStatus.NotFound.ToString();
            return response;
        }
        if (employee.Role == null || employee.Role.RoleName != RoleName.Courier.ToString())
        {
            response.Messages = new[] { "Employee does not have the Courier role!" };
            response.ResultStatus = ResultStatus.Invalid.ToString();
            return response;
        }

        response.RoleName = RoleName.Courier.ToString();
        response.Data = _mapper.Map<EmployeeResponse>(employee);
        response.Messages = new[] { "Successfully!" };
        response.ResultStatus = ResultStatus.Success.ToString();

        return response;
    }
}