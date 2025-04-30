using BusinessObject.Entities;

namespace Repository.Interface;

public interface IPromotionRepository
{
    Task<List<Promotion>> GetAllPromotion();
    Task<Promotion> GetPromotionById(Guid id);
    Task<Promotion> AddPromotion(Promotion promotion);
    Task<Promotion> UpdatePromotion(Promotion promotion);
    Task<Promotion> DeletePromotion(Guid id);
}