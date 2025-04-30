using System.Net;
using BusinessObject.DTO.Category;
using BusinessObject.DTO.Commons;
using BusinessObject.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interface;

namespace WebAPI.Controllers;
[Route("api/categories")]
[ApiController]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }
    [HttpGet]
    public async Task<IActionResult> GetCategory()
    {
        var result = await _categoryService.GetAllCategory();
        return Ok(result);
    }
    [HttpGet("Id")]
    public async Task<IActionResult> GetCategoryById(Guid id)
    {
        var result = await _categoryService.GetCategoryById(id);

        if (result.ResultStatus != ResultStatus.Success.ToString())
            return StatusCode((int)HttpStatusCode.InternalServerError, result);

        return Ok(result);
    }
    [HttpPost("create-category")]
    public async Task<ActionResult<Result<Category>>> CreateCategory( [FromBody] CreateCategoryRequest request)
    {
        var result = await _categoryService.CreateCategory(request);
        if (result.ResultStatus != ResultStatus.Success.ToString())
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, result);
        }
        return Ok(result);
    }
    // [Authorize(Roles = "Admin")]
    [HttpPut("{categoryId}")]
    public async Task<IActionResult> UpdateNameCategory([FromRoute] Guid categoryId, UpdateCategoryRequest request)
    {
        var result = await _categoryService.UpdateNameCategory(categoryId, request);
        return result.ResultStatus != ResultStatus.Success .ToString()? StatusCode((int)HttpStatusCode.InternalServerError, result) : Ok(result);
    }

    [HttpDelete("delete-category")]
    public async Task<ActionResult<Result<Category>>> DeleteCategory(Guid id)
    {
        var result = await _categoryService.DeleteCategory(id);
        if (result.ResultStatus != ResultStatus.Success.ToString())
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, result);
        }
        return Ok(result);
    }
}