using System.Net;
using BusinessObject.DTO.Category;
using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Promotion;
using BusinessObject.Entities;
using Microsoft.AspNetCore.Mvc;
using Service.Interface;

namespace WebAPI.Controllers;
[Route("api/promotions")]
[ApiController]
public class PromotionController : Controller
{
    private readonly IPromotionService _promotionService;

    public PromotionController(IPromotionService promotionService)
    {
        _promotionService = promotionService;
    }
    [HttpGet]
    public async Task<IActionResult> GetPromotion()
    {
        var result = await _promotionService.GetAllPromotion();
        return Ok(result);
    }

    [HttpGet("Id")]
    public async Task<IActionResult> GetPromotionById(Guid id)
    {
        var result = await _promotionService.GetPromotionById(id);

        if (result.ResultStatus != ResultStatus.Success.ToString())
            return StatusCode((int)HttpStatusCode.InternalServerError, result);

        return Ok(result);
    }
    [HttpPost("create-promotion")]
    public async Task<ActionResult<Result<Promotion>>> CreatePromotion( [FromBody] CreatePromotionRequest request)
    {
        var result = await _promotionService.CreatePromotion(request);
        if (result.ResultStatus != ResultStatus.Success.ToString())
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, result);
        }
        return Ok(result);
    }
    [HttpPut("{promotionId}")]
    public async Task<IActionResult> UpdatePromotion([FromRoute] Guid promotionId, UpdatePromotionRequest request)
    {
        var result = await _promotionService.UpdatePromotion(promotionId ,request);
        return result.ResultStatus != ResultStatus.Success .ToString()? StatusCode((int)HttpStatusCode.InternalServerError, result) : Ok(result);
    }

    [HttpDelete("delete-promotion")]
    public async Task<ActionResult<Result<Promotion>>> DeletePromotion(Guid id)
    {
        var result = await _promotionService.DeletePromotion(id);
        if (result.ResultStatus != ResultStatus.Success.ToString())
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, result);
        }
        return Ok(result);
    }
}