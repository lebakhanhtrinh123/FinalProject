using AutoMapper;
using BusinessObject.DTO.Commons;
using BusinessObject.DTO.FeedBack;
using BusinessObject.Entities;
using Core.Infrastructures;
using Repository.Interface;
using Service.Interface;

namespace Service.Implement;

public class FeedbackService : IFeedbackService
{
    private readonly IFeedbackRepository _feedbackRepository;
    private IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICustomerRepository _customerRepository;

    public FeedbackService(IFeedbackRepository feedbackRepository, IMapper mapper, IUnitOfWork unitOfWork , ICustomerRepository customerRepository)
    {
        _feedbackRepository = feedbackRepository;
        _mapper = mapper;
        _unitOfWork = unitOfWork;
        _customerRepository = customerRepository;
    }

    public async Task<List<FeedbackResponse>> GetAllFeedback()
    {
        var list = await _feedbackRepository.GetAllFeedback();
        return _mapper.Map<List<FeedbackResponse>>(list);
    }

    public async Task<Result<FeedbackResponse>> CreateFeedback(CreateFeedbackRequest request)
    {
        var order = await _unitOfWork.Repository<Order>().GetByIdAsync(request.OrderId);
        if (order is null)
        {
            throw new OrderNotFoundException();
        }

        if (order.Status != OrderStatus.Completed.ToString())
        {
            throw new OrderNotAvailableToFeedback("This order is not completed");
        }
        var feedback = new Feedback()
        {
            Descripstion = request.Descripstion,
            Rating = request.Rating,
            OrderId = request.OrderId
        };
        await _feedbackRepository.CreateFeedback(feedback);
        return new Result<FeedbackResponse>()
        {
            Data = new FeedbackResponse()
            {
                FeedbackId = feedback.FeedbackId,
                OrderId = feedback.OrderId,
                CustomerId = feedback.CustomerId,
                Descripstion = feedback.Descripstion,
                Rating = feedback.Rating,
                CreateAt = DateTime.UtcNow,
                
            },
            Messages = new[] { "Successfully" },
            ResultStatus = ResultStatus.Success.ToString()
        };
    }

}