using AutoMapper;
using BusinessObject.DTO.Employee;
using BusinessObject.Entities;

namespace Service.AutoMapper;

public partial class MapperConfig : Profile
{
    partial void AddEmployeeMapperConfig()
    {
        CreateMap<Employee, EmployeeResponse>().ReverseMap();
        CreateMap<Employee, UpdateEmployeeRequest>().ReverseMap();
    }
}