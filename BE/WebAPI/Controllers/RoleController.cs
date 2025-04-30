using BusinessObject.DTO.Response;
using BusinessObject.DTO.Role;
using Core.Infrastructures;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Service.Interface;


namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : Controller
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }
        [HttpGet("GetAllRole")]
        public async Task<IActionResult> GetAllRole()
        {
           var result  = await _roleService.GetAllRole();
           return Ok(new BaseResponseModel<IEnumerable<RoleResponse>>(
                statusCode: StatusCodes.Status200OK,
                code: ResponseCodeConstants.SUCCESS,
                data: result));
        }
        [HttpGet("GetRoleById")]
        public async Task<IActionResult> GetRoleById(Guid id)
        {
            var result = await _roleService.GetRoleById(id);
            return Ok(new BaseResponseModel<RoleResponse>(
               statusCode: StatusCodes.Status200OK,
               code: ResponseCodeConstants.SUCCESS,
               data: result));
        }
        [HttpPost("CreateRole")]
        public async Task<IActionResult> AddRole(RoleRequest roleRequest)
        {
            await _roleService.CreateRole(roleRequest);
            return Ok(new BaseResponseModel<string>(
                         statusCode: StatusCodes.Status200OK,
                         code: ResponseCodeConstants.SUCCESS,
                         data: "Thêm role mới thành công"));
        }
        [HttpDelete("DeleteRole/{id}")]
        public async Task<IActionResult> DeleteStore(Guid id)
        {
            await _roleService.DeleteRole(id);
            return Ok(new BaseResponseModel<string>(
                            statusCode: StatusCodes.Status200OK,
                            code: ResponseCodeConstants.SUCCESS,
                            data: "xóa role thành công"));
        }
        [HttpPut("UpdateRole/{id}")]
        public async Task<IActionResult> UpdateRole([FromBody] RoleRequest roleRequest,Guid id)
        {
            await _roleService.UpdateRole(roleRequest,id);
            return Ok(new BaseResponseModel<string>(
                        statusCode: StatusCodes.Status200OK,
                        code: ResponseCodeConstants.SUCCESS,
                        data: "cập nhật role thành công"));
        }

    }
}
