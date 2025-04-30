using BusinessObject.Context;
using BusinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Interface;

namespace Repository.Implement;

public class FeedbackRepository : IFeedbackRepository
{
    private readonly CustomFlowerChainContext _context;

    public FeedbackRepository(CustomFlowerChainContext context)
    {
        _context = context;
    }
    public async Task<List<Feedback>> GetAllFeedback()
    {
        var list = await _context.Feedbacks.ToListAsync();
        return list;
    }

    public async Task<Feedback> CreateFeedback(Feedback feedback)
    {
        await _context.Feedbacks.AddAsync(feedback);
        await _context.SaveChangesAsync();
        return feedback;
    }
}