using AutoMapper;
using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Promotion;
using BusinessObject.Entities;
using Repository.Interface;
using Service.Interface;

namespace Service.Implement;

public class PromotionService : IPromotionService
{
    private readonly IPromotionRepository _promotionRepository;
    private IMapper _mapper;
    public  PromotionService(IPromotionRepository promotionRepository , IMapper mapper)
    {
        _promotionRepository = promotionRepository;
        _mapper = mapper;
        
    }
    public async Task<List<PromotionResponse>> GetAllPromotion()
    {
        var list = await _promotionRepository.GetAllPromotion();
        return _mapper.Map<List<PromotionResponse>>(list);
    }

    public async Task<Result<Promotion>> CreatePromotion(CreatePromotionRequest request)
    {
        if (string.IsNullOrEmpty(request.PromotionName))
        {
            return new Result<Promotion>
            {
                ResultStatus = ResultStatus.NotFound.ToString(),
                Messages = new [] {"Promotion name is required"}
            };
        }
        if (request.StartDate == null || request.EndDate == null)
        {
            return new Result<Promotion>
            {
                ResultStatus = ResultStatus.NotFound.ToString(),
                Messages = new []{"Start date and end date are required"}
            };
        }
        if (request.StartDate.Value.Date < DateTime.UtcNow.Date)
        {
            return new Result<Promotion>
            {
                ResultStatus = ResultStatus.NotFound.ToString(),
                Messages = new []{"Start date must be today or later"}
            };
        }
        if (request.StartDate >= request.EndDate)
        {
            return new Result<Promotion>
            {
                ResultStatus = ResultStatus.NotFound.ToString(),
                Messages = new [] {"Start date must be earlier than end date"}
            };
        }
        bool status = DateTime.UtcNow <= request.EndDate;
        var promotion = new Promotion
        {
            PromotionName = request.PromotionName,
            Quantity = request.Quantity,
            PromotionDiscount = request.PromotionDiscount,
            PromotionCode = request.PromotionCode,
            StartDate = request.StartDate.Value,
            EndDate = request.EndDate.Value,
            CreateAt = DateTime.UtcNow,
            Status = status, 
        };
        await _promotionRepository.AddPromotion(promotion);
        return new Result<Promotion>
        {
            ResultStatus = ResultStatus.Success.ToString(),
            Messages = new []{"Promotion created successfully"},
            Data = promotion
        };
    }

    public async Task<Result<PromotionResponse>> UpdatePromotion(Guid id, UpdatePromotionRequest request)
{
    var promotion = await _promotionRepository.GetPromotionById(id);
    if (promotion == null)
    {
        return new Result<PromotionResponse>
        {
            ResultStatus = ResultStatus.NotFound.ToString(),
            Messages = new [] {"Promotion not found"} 
        };
    }
    if (!string.IsNullOrEmpty(request.PromotionName))
    {
        promotion.PromotionName = request.PromotionName;
    }
    if (!string.IsNullOrEmpty(request.PromotionCode))
    {
        promotion.PromotionCode = request.PromotionCode;
    }
    if (request.StartDate.HasValue && request.StartDate.Value.Date >= DateTime.UtcNow.Date)
    {
        promotion.StartDate = request.StartDate.Value;
    }
    if (request.EndDate.HasValue && request.EndDate.Value > promotion.StartDate)
    {
        promotion.EndDate = request.EndDate.Value;
    }
    if (request.Quantity.HasValue)
    {
        promotion.Quantity = request.Quantity.Value;
    }
    if (request.PromotionDiscount.HasValue)
    {
        promotion.PromotionDiscount = request.PromotionDiscount.Value;
    }
    promotion.Status = promotion.EndDate > DateTime.UtcNow;
    promotion.UpdateAt = DateTime.UtcNow;

    await _promotionRepository.UpdatePromotion(promotion);

    return new Result<PromotionResponse>
    {
        Data = new PromotionResponse
        {
            PromotionId = promotion.PromotionId,
            PromotionName = promotion.PromotionName,
            PromotionCode = promotion.PromotionCode,
            StartDate = promotion.StartDate,
            EndDate = promotion.EndDate,
            Quantity = promotion.Quantity,
            PromotionDiscount = promotion.PromotionDiscount,
            Status = promotion.Status,
            CreateAt = promotion.CreateAt,
            UpdateAt = promotion.UpdateAt
        },
        ResultStatus = ResultStatus.Success.ToString(),
        Messages = new[] { "Update successfully" }
    };
}

    public async Task<Result<Promotion>> DeletePromotion(Guid id)
    {
        var promotion = await _promotionRepository.GetPromotionById(id);
    
        if (promotion == null)
        {
            return new Result<Promotion>
            {
                ResultStatus = ResultStatus.NotFound.ToString(),
                Messages = new []{"Promotion not found."}
            };
        }

        await _promotionRepository.DeletePromotion(id);

        return new Result<Promotion>
        {
            ResultStatus = ResultStatus.Success.ToString(),
            Messages = new []{"Promotion deleted successfully."}
        };
    }

    public async Task<Result<PromotionResponse>> GetPromotionById(Guid id)
    {
        var response = new Result<PromotionResponse>();
        var promotion = await _promotionRepository.GetPromotionById(id);
        if (promotion == null)
        {
            response.Messages = ["Promotion not found!"];
            response.ResultStatus = ResultStatus.NotFound.ToString();
            return response;
        }
        else
        {
            response.Data = _mapper.Map<PromotionResponse>(promotion);
            response.Messages = ["Successfully!"];
            response.ResultStatus = ResultStatus.Success.ToString();
            return response;
        }
    }
}