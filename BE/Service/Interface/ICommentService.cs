using BusinessObject.DTO.Comment;
using BusinessObject.DTO.Commons;

namespace Service.Interface;

public interface ICommentService
{
    Task<List<CommentResponse>> GetAllComment();
    Task<Result<CommentResponse>> CreateComment(CreateCommentRequest request);
}