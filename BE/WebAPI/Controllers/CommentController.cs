using System.Net;
using BusinessObject.DTO.Category;
using BusinessObject.DTO.Comment;
using BusinessObject.DTO.Commons;
using BusinessObject.Entities;
using Microsoft.AspNetCore.Mvc;
using Service.Interface;

namespace WebAPI.Controllers;
[ApiController]
[Route("api/comment")]
public class CommentController : Controller
{
   private readonly ICommentService _commentService;

   public CommentController(ICommentService commentService)
   {
      _commentService = commentService;
   }
   [HttpGet]
   public async Task<IActionResult> GetComments()
   {
      var result = await _commentService.GetAllComment();
      return Ok(result);
   }
   [HttpPost("create-comment")]
   public async Task<ActionResult<Result<Comment>>> CreateComment( [FromBody] CreateCommentRequest request)
   {
      var result = await _commentService.CreateComment(request);
      if (result.ResultStatus != ResultStatus.Success.ToString())
      {
         return StatusCode((int)HttpStatusCode.InternalServerError, result);
      }
      return Ok(result);
   }
}