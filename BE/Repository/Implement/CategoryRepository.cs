using BusinessObject.Context;
using BusinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Interface;

namespace Repository.Implement;

public class CategoryRepository : ICategoryRepository
{
    private readonly CustomFlowerChainContext _context;

    public CategoryRepository(CustomFlowerChainContext context)
    {
        _context = context;
    }
    public async Task<List<Category>> GetAllCategory()
    {
        var list = await _context.Categories.ToListAsync();
        return list;
    }

    public async Task<Category> GetCategoryById(Guid id)
    {
        var cate = await _context.Categories.FirstOrDefaultAsync(x => x.CategoryId == id);
        return cate;
    }

    public async Task<Category> AddCategory(Category category)
    {
        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateCategory(Category category)
    {
         _context.Categories.Update(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> DeleteCategory(Guid id)
    {
        var cate = await _context.Categories.FirstOrDefaultAsync(x => x.CategoryId == id);
        if (cate == null)
        {
            return null;
        }
        _context.Categories.Remove(cate);
        await _context.SaveChangesAsync();
        return cate;
    }
}