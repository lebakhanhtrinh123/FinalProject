using BusinessObject.DTO.Product;
using BusinessObject.DTO.Response;
using Core.Infrastructures;
using Microsoft.AspNetCore.Mvc;
using Service.Implement;
using Service.Interface;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : Controller
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }
        [HttpGet("GetAllProduct")]

        public async Task<IActionResult> GetProducts()
        {
            var result = await _productService.GetProducts();
            return Ok(new BaseResponseModel<IEnumerable<ProductResponse>>(
               statusCode: StatusCodes.Status200OK,
               code: ResponseCodeConstants.SUCCESS,
               data: result));
        }
        [HttpGet("GetProductById")]
        public async Task<IActionResult> GetStoreById(Guid id)
        {
            var result = await _productService.GetProductById(id);
            return Ok(new BaseResponseModel<ProductResponse>(
                statusCode: StatusCodes.Status200OK,
                code: ResponseCodeConstants.SUCCESS,
                data: result));
        }
        [HttpGet("GetProductByStoreId")]
        public async Task<IActionResult> GetProductsByStoreId(Guid storeId)
        {
            var result = await _productService.GetProductsByStoreId(storeId);
            return Ok(new BaseResponseModel<IEnumerable<ProductResponse>>(
               statusCode: StatusCodes.Status200OK,
               code: ResponseCodeConstants.SUCCESS,
               data: result));
        }

        [HttpPost("CreateProduct")]
        public async Task<IActionResult> CreateProduct(ProductRequest productRequest,Guid storeId)
        {
            await _productService.CreateProduct(productRequest, storeId);
            return Ok(new BaseResponseModel<string>(
                       statusCode: StatusCodes.Status200OK,
                       code: ResponseCodeConstants.SUCCESS,
                       data: "Thêm sản phẩm mới thành công"));
        }
        [HttpPut("UpdateProduct/{productId}")]
        public async Task<IActionResult> UpdateProduct(UpdateProductRequest updateProductRequest,Guid productId)
        {
            await _productService.UpdateProduct(updateProductRequest, productId);
            return Ok(new BaseResponseModel<string>(
                         statusCode: StatusCodes.Status200OK,
                         code: ResponseCodeConstants.SUCCESS,
                         data: "cập nhật sẩn phẩm thành công"));
        }
        [HttpDelete("DeleteProduct/{id}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            await _productService.DeleteProduct(id);

            return Ok(new BaseResponseModel<string>(
                             statusCode: StatusCodes.Status200OK,
                             code: ResponseCodeConstants.SUCCESS,
                             data: "xóa sản phẩm thành công"));


        }
    }
}
