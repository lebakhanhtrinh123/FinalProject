using AutoMapper;
using BusinessObject.DTO.Category;
using BusinessObject.DTO.Commons;
using BusinessObject.Entities;
using Core.Infrastructures;
using Repository.Implement;
using Repository.Interface;
using Service.Interface;

namespace Service.Implement;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private IMapper _mapper;

    public CategoryService(ICategoryRepository categoryRepository , IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }
    public async Task<List<CategoryResponse>> GetAllCategory()
    {
        var list = await _categoryRepository.GetAllCategory();
        return _mapper.Map<List<CategoryResponse>>(list);
    }

    public async Task<Result<Category>> CreateCategory( CreateCategoryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Category name cannot be null or whitespace", nameof(request.Name));
        }
        var newCategory = new Category
        {
            CategoryName = request.Name,
            Status = true, 
            CreateAt = request.CreateAt ?? DateTime.UtcNow,
            UpdateAt = request.UpdateAt ?? DateTime.UtcNow
        };
        await _categoryRepository.AddCategory(newCategory);
        return new Result<Category>
        {
            Data = newCategory,
            ResultStatus = ResultStatus.Success.ToString(),
            Messages = new[] { "Category created successfully" }
        };
    }

    public async Task<Result<CategoryResponse>> UpdateNameCategory(Guid id, UpdateCategoryRequest request)
    {
        var category = await _categoryRepository.GetCategoryById(id);
        if (category == null)
        {
            throw new CategoryNotFound("Cannot find category");
        }
        if (string.IsNullOrWhiteSpace(request.CategoryName))
        {
            throw new ArgumentException("Cannot replace by white space", nameof(request.CategoryName));
        }
        category.CategoryName = request.CategoryName;
        await _categoryRepository.UpdateCategory(category);
        return new Result<CategoryResponse>
        {
            Data = new CategoryResponse
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
                Status = category.Status
            },
            ResultStatus = ResultStatus.Success.ToString(),
            Messages = new[] { "Update successfully" }
        };
    }

    public async Task<Result<Category>> DeleteCategory(Guid id)
    {
        var category = await _categoryRepository.GetCategoryById(id);
    
        if (category == null)
        {
            return new Result<Category>
            {
                ResultStatus = ResultStatus.NotFound.ToString(),
                Messages = new []{"Category not found."}
            };
        }

        await _categoryRepository.DeleteCategory(id);

        return new Result<Category>
        {
            ResultStatus = ResultStatus.Success.ToString(),
            Messages = new []{"Category deleted successfully."}
        };
    }

    public async Task<Result<CategoryResponse>> GetCategoryById(Guid id)
    {
        var response = new Result<CategoryResponse>();
        var category = await _categoryRepository.GetCategoryById(id);
        if (category == null)
        {
            response.Messages = ["Category not found!"];
            response.ResultStatus = ResultStatus.NotFound.ToString();
            return response;
        }
        else
        {
            response.Data = _mapper.Map<CategoryResponse>(category);
            response.Messages = ["Successfully!"];
            response.ResultStatus = ResultStatus.Success.ToString();
            return response;
        }
    }

    public async Task<Result<CategoryResponse>> UpdateStatusCategory(Guid id)
    {
        throw new NotImplementedException();
    }
}