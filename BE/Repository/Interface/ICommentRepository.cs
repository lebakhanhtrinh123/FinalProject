using BusinessObject.Entities;

namespace Repository.Interface;

public interface ICommentRepository
{
    Task<List<Comment>> GetAllComment();
    Task<Comment> AddComment(Comment comment);
}