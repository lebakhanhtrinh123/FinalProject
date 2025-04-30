using BusinessObject.Context;
using BusinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Interface;

namespace Repository.Implement;

public class PromotionRepository : IPromotionRepository
{
    private readonly CustomFlowerChainContext _context;

    public PromotionRepository(CustomFlowerChainContext context)
    {
        _context = context;
    }

    public async Task<List<Promotion>> GetAllPromotion()
    {
        var list = await _context.Promotions.ToListAsync();
        return list;
    }

    public async Task<Promotion> GetPromotionById(Guid id)
    {
        var promo = await _context.Promotions.FirstOrDefaultAsync(x => x.PromotionId == id);
        return promo;
    }

    public async Task<Promotion> AddPromotion(Promotion promotion)
    {
        await _context.Promotions.AddAsync(promotion);
        await _context.SaveChangesAsync();
        return promotion;
    }

    public async Task<Promotion> UpdatePromotion(Promotion promotion)
    {
        _context.Promotions.Update(promotion);
        await _context.SaveChangesAsync();
        return promotion;
    }

    public async Task<Promotion> DeletePromotion(Guid id)
    {
        var promo = await _context.Promotions.FirstOrDefaultAsync(x => x.PromotionId == id);
        if (promo == null)
        {
            return null;
        }
        _context.Promotions.Remove(promo);
        await _context.SaveChangesAsync();
        return promo;
    }
}