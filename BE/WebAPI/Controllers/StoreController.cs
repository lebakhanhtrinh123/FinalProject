using BusinessObject.DTO.Request;
using BusinessObject.DTO.Response;
using Core.Infrastructures;
using MailKit;
using Microsoft.AspNetCore.Mvc;
using Service.Implement;
using Service.Interface;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoreController : Controller
    {
        private readonly IStoreService _storeService;

        public StoreController(IStoreService storeService)
        {
            _storeService = storeService;
        }

        [HttpPost("CreateStore")]
        public async Task<IActionResult> AddStore(StoreRequest storeRequest)
        {
            await _storeService.AddStore(storeRequest);
            return Ok(new BaseResponseModel<string>(
                          statusCode: StatusCodes.Status200OK,
                          code: ResponseCodeConstants.SUCCESS,
                          data: "Thêm cửa hàng mới thành công"));
        }
        [HttpGet("GetAllStore")]
        public async Task<IActionResult> GetStore()
        {
            var result = await _storeService.GetStore();
            return Ok(new BaseResponseModel<IEnumerable<StoreResponse>>(
                statusCode: StatusCodes.Status200OK,
                code: ResponseCodeConstants.SUCCESS,
                data: result));
        }
        [HttpGet("GetStoreById")]
        public async Task<IActionResult> GetStoreById(Guid id)
        {
            var result = await _storeService.GetStoreById(id);
            return Ok(new BaseResponseModel<StoreResponse>(
                statusCode: StatusCodes.Status200OK,
                code: ResponseCodeConstants.SUCCESS,
                data: result));
        }
        [HttpPut("UpdateStore/{id}")]
        public async Task<IActionResult> UpdateStore([FromBody] StoreRequest storeRequest, Guid id)

        {
            await _storeService.UpdateStore(storeRequest, id);
            return Ok(new BaseResponseModel<string>(
                         statusCode: StatusCodes.Status200OK,
                         code: ResponseCodeConstants.SUCCESS,
                         data: "cập nhật cửa hàng thành công"));

        }
        [HttpDelete("DeleteStore/{id}")]
        public async Task<IActionResult> DeleteStore(Guid id)
        {
            await _storeService.DeleteStore(id);

            return Ok(new BaseResponseModel<string>(
                             statusCode: StatusCodes.Status200OK,
                             code: ResponseCodeConstants.SUCCESS,
                             data: "xóa cửa hàng thành công"));


        } 
    }   
}
