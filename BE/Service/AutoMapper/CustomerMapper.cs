using AutoMapper;
using BusinessObject.DTO.Customer;
using BusinessObject.Entities;

namespace Service.AutoMapper;

public partial class MapperConfig : Profile
{
    partial void AddCustomerMapperConfig()
    {
        CreateMap<Customer, CustomerResponse>().ReverseMap();
        CreateMap<Category, CreateCustomerRequest>().ReverseMap();
        CreateMap<Category, UpdateCustomerRequest>().ReverseMap();
    }
}