using BusinessObject.DTO.Commons;
using BusinessObject.DTO.FeedBack;

namespace Service.Interface;

public interface IFeedbackService
{
    Task<List<FeedbackResponse>> GetAllFeedback();
    Task<Result<FeedbackResponse>> CreateFeedback(CreateFeedbackRequest request);
}