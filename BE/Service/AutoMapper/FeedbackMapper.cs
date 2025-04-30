using AutoMapper;
using BusinessObject.DTO.Category;
using BusinessObject.DTO.FeedBack;
using BusinessObject.Entities;

namespace Service.AutoMapper;

public partial class MapperConfig : Profile
{
    partial void AddFeedbackMapperConfig()
    {
        CreateMap<Feedback, FeedbackResponse>().ReverseMap();
        CreateMap<Feedback, CreateFeedbackRequest>().ReverseMap();
        
    }
}