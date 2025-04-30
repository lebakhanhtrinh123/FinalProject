using AutoMapper;
using BusinessObject.DTO.Comment;
using BusinessObject.DTO.Commons;
using BusinessObject.Entities;
using Repository.Interface;
using Service.Interface;

namespace Service.Implement;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepository;
    private readonly IMapper _mapper;

    public CommentService(ICommentRepository commentRepository , IMapper mapper)
    {
        _commentRepository = commentRepository;
        _mapper = mapper;
    }
    public async Task<List<CommentResponse>> GetAllComment()
    {
        var list = await _commentRepository.GetAllComment();
        return _mapper.Map<List<CommentResponse>>(list);
    }

    public async Task<Result<CommentResponse>> CreateComment(CreateCommentRequest request)
    {
        var response = new Result<CommentResponse>();
        if (request.ProductId == null || request.CustomerId == null)
        {
            response.ResultStatus = ResultStatus.Error.ToString();
            response.Messages = new[] { "ProductId and CustomerId are required." };
            return response;
        }
        if (request.Rating == null || request.Rating < 1 || request.Rating > 5)
        {
            response.ResultStatus = ResultStatus.Error.ToString();
            response.Messages = new[] { "Rating must be between 1 and 5." };
            return response;
        }
        var comment = new Comment
        {
            ProductId = request.ProductId.Value,
            CustomerId = request.CustomerId.Value,
            Rating = request.Rating.Value,
            Feedback = request.Feedback ?? string.Empty,
            Status = request.Status ?? true,
        };
        await _commentRepository.AddComment(comment);
        response.ResultStatus = ResultStatus.Success.ToString();
        response.Messages = new[] { "Comment created successfully." };
        response.Data = new CommentResponse
        {
            CommentId = comment.CommentId,
            ProductId = comment.ProductId,
            CustomerId = comment.CustomerId,
            Rating = comment.Rating,
            Feedback = comment.Feedback,
            Status = comment.Status,
        };
        return response;
    }
}