using AutoMapper;
using BusinessObject.DTO.Promotion;
using BusinessObject.Entities;

namespace Service.AutoMapper;

public partial class MapperConfig : Profile
{
    partial void AddPromotionMapperConfig()
    {
        CreateMap<Promotion, PromotionResponse>().ReverseMap();
        CreateMap<Promotion, CreatePromotionRequest>().ReverseMap();
        CreateMap<Promotion, UpdatePromotionRequest>().ReverseMap();
    }
}