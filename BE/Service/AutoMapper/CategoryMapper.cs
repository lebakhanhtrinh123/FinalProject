using AutoMapper;
using BusinessObject.DTO.Category;
using BusinessObject.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Service.AutoMapper;

public partial class MapperConfig : Profile
{
    partial void AddCategoryMapperConfig()
    {
        CreateMap<Category, CategoryResponse>().ReverseMap();
        CreateMap<Category, CreateCategoryRequest>().ReverseMap();
        CreateMap<Category, UpdateCategoryRequest>().ReverseMap();
        CreateMap<Category, CategoryRequest>().ReverseMap();
    }
}