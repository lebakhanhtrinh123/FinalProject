using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Promotion;
using BusinessObject.Entities;

namespace Service.Interface;

public interface IPromotionService
{
    Task<List<PromotionResponse>> GetAllPromotion();
    Task<Result<Promotion>> CreatePromotion(CreatePromotionRequest request);
    Task<Result<PromotionResponse>> UpdatePromotion(Guid id , UpdatePromotionRequest request);
    Task<Result<Promotion>> DeletePromotion(Guid id);
    Task<Result<PromotionResponse>> GetPromotionById(Guid id);
}