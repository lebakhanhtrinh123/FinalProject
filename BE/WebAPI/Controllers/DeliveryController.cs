using BusinessObject.DTO.Delivery;
using BusinessObject.DTO.Order;
using Core.Infrastructures;
using Microsoft.AspNetCore.Mvc;
using Service.Implement;
using Service.Interface;

namespace WebAPI.Controllers
{
    [Route("api/Delivery")]
    [ApiController]
    public class DeliveryController : Controller
    {
        private IDeliveryService deliveryService;

        public DeliveryController(IDeliveryService deliveryService)
        {
            this.deliveryService = deliveryService;
        }
        [HttpGet("GetDeliveryByShipperId")]
        public async Task<IActionResult> GetDeliveryByShipperId(Guid ShipperId)
        {
            var result = await deliveryService.GetDeliveryByShipperId(ShipperId);
            return Ok(new BaseResponseModel<IEnumerable<DeliveryResponse>>(
              statusCode: StatusCodes.Status200OK,
              code: ResponseCodeConstants.SUCCESS,
              data: result));
        }
        [HttpGet("GetDeliveryById")]
        public async Task<IActionResult> GetDeliveryId(Guid Id)
        {
            var result = await deliveryService.GetDeliveryById(Id);
            return Ok(new BaseResponseModel<DeliveryResponse>(
              statusCode: StatusCodes.Status200OK,
              code: ResponseCodeConstants.SUCCESS,
              data: result));
        }
        [HttpPost("CreateDelivery")]
        public async Task<IActionResult> CreateOrder(DeliveryRequest deliveryRequest, Guid OrderId)
        {
            await deliveryService.CreateDelivery(deliveryRequest, OrderId);
            return Ok(new BaseResponseModel<string>(
                     statusCode: StatusCodes.Status200OK,
                     code: ResponseCodeConstants.SUCCESS,
                     data: "Order thành công"));
        }
        [HttpPut("UpdateDeliveryByShipperId")]
        public async Task<IActionResult> UpdateDeliveryByShipperId(UpdateDeliveryByShipperResponse updateDeliveryByShipperResponse, Guid DeliveryId)
        {
            await deliveryService.UpdateDeliveryByShipperId(updateDeliveryByShipperResponse, DeliveryId);
            return Ok(new BaseResponseModel<string>(
                      statusCode: StatusCodes.Status200OK,
                      code: ResponseCodeConstants.SUCCESS,
                      data: "cập nhật sẩn phẩm thành công"));
        }
        [HttpPut("UpdateDeliveryByStaffId")]
        public async Task<IActionResult> UpdateDeliveryByStaffId(DeliveryRequest deliveryRequest, Guid DeliveryId)
        {
            await deliveryService.UpdateDeliveryByStaffId(deliveryRequest, DeliveryId);
            return Ok(new BaseResponseModel<string>(
                      statusCode: StatusCodes.Status200OK,
                      code: ResponseCodeConstants.SUCCESS,
                      data: "cập nhật sẩn phẩm thành công"));
        }
    }
}
