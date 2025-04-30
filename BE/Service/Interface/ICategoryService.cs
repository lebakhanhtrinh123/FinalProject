using BusinessObject.DTO.Category;
using BusinessObject.DTO.Commons;
using BusinessObject.Entities;

namespace Service.Interface;

public interface ICategoryService
{
    Task<List<CategoryResponse>> GetAllCategory();
    Task<Result<Category>> CreateCategory(CreateCategoryRequest request);
    Task<Result<CategoryResponse>> UpdateNameCategory(Guid id,UpdateCategoryRequest request);
    Task<Result<Category>> DeleteCategory(Guid id);
    Task<Result<CategoryResponse>> GetCategoryById(Guid id);

}