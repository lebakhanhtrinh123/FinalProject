using BusinessObject.Entities;

namespace Repository.Interface;

public interface IFeedbackRepository
{
    Task<List<Feedback>> GetAllFeedback();
    Task<Feedback> CreateFeedback(Feedback feedback);
}