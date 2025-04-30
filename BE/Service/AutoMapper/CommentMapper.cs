using AutoMapper;
using BusinessObject.DTO.Category;
using BusinessObject.DTO.Comment;
using BusinessObject.Entities;

namespace Service.AutoMapper;

public  partial class MapperConfig : Profile
{
    partial void AddCommentMapperConfig()
    {
        CreateMap<Comment, CommentResponse>().ReverseMap();
        CreateMap<Comment, CreateCommentRequest >().ReverseMap();
        
    }
}