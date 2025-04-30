using BusinessObject.DTO.Cart;
using BusinessObject.DTO.Order;
using Core.Infrastructures;
using Microsoft.AspNetCore.Mvc;
using Service.Implement;
using Service.Interface;

namespace WebAPI.Controllers
{
    [Route("api/Cart")]
    [ApiController]
    public class CartController : Controller
    {
        private ICartService cartService;

        public CartController(ICartService cartService)
        {
            this.cartService = cartService;
        }
        [HttpGet("GetCartByCustomer")]
        public async Task<IActionResult> GetCartByCustomer(Guid customerID)
        {
            var result = await cartService.GetCartByUserId(customerID);
            return Ok(new BaseResponseModel<IEnumerable<CartResponse>>(
              statusCode: StatusCodes.Status200OK,
              code: ResponseCodeConstants.SUCCESS,
              data: result));
        }
        [HttpPost("CreateCart")]
        public async Task<IActionResult> AddToCart(Guid customerID, Guid ProductID, int Quantity)
        {
            await cartService.AddToCart(customerID, ProductID, Quantity);
            return Ok(new BaseResponseModel<string>(
                     statusCode: StatusCodes.Status200OK,
                     code: ResponseCodeConstants.SUCCESS,
                     data: "Order thành công"));
        }
        [HttpPut("UpdateQuantity")]
        public async Task<IActionResult> UpdateQuantityAsync(Guid cartId, int quantity)
        {
            await cartService.UpdateQuantityAsync(cartId, quantity);
            return Ok(new BaseResponseModel<string>(
                      statusCode: StatusCodes.Status200OK,
                      code: ResponseCodeConstants.SUCCESS,
                      data: "cập nhật sẩn phẩm thành công"));
        }
        [HttpDelete("RemoveCart")]
        public async Task<IActionResult> RemoveCart(Guid customerId)
        {
            await cartService.RemoveCart(customerId);

            return Ok(new BaseResponseModel<string>(
                             statusCode: StatusCodes.Status200OK,
                             code: ResponseCodeConstants.SUCCESS,
                             data: "xóa sản phẩm thành công"));
        }
        [HttpDelete("RemoveByCartID")]
        public async Task<IActionResult> RemoveByCartID(Guid cartId)
        {
            await cartService.RemoveByCartID(cartId);

            return Ok(new BaseResponseModel<string>(
                             statusCode: StatusCodes.Status200OK,
                             code: ResponseCodeConstants.SUCCESS,
                             data: "xóa sản phẩm thành công"));
        }
    }
}
