using System.Net;
using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Employee;
using BusinessObject.Entities;
using Microsoft.AspNetCore.Mvc;
using Service.Interface;

namespace WebAPI.Controllers;
[Route("api/employees")]
[ApiController]

public class EmployeeController : ControllerBase
{
   private readonly IEmployeeService _employeeService;

   public EmployeeController(IEmployeeService employeeService)
   {
      _employeeService = employeeService;
   }
   [HttpGet]
   public async Task<IActionResult> GetEmployee()
   {
      var result = await _employeeService.GetAllEmployee();
      return Ok(result);
   }
   [HttpGet("storeId-florist")]
   public async Task<IActionResult> GetFloristWithStoreId(Guid storeid)
   {
      var result = await _employeeService.GetFloristWithStoreId(storeid);

      if (result.ResultStatus != ResultStatus.Success.ToString())
         return StatusCode((int)HttpStatusCode.InternalServerError, result);

      return Ok(result);
   }
   [HttpGet("storeId-courier")]
   public async Task<IActionResult> GetCourierWithStoreId(Guid storeid)
   {
      var result = await _employeeService.GetCourierWithStoreId(storeid);

      if (result.ResultStatus != ResultStatus.Success.ToString())
         return StatusCode((int)HttpStatusCode.InternalServerError, result);

      return Ok(result);
   }
   [HttpGet("Id")]
   public async Task<IActionResult> GetEmployeeById(Guid id)
   {
      var result = await _employeeService.GetEmployeeById(id);

      if (result.ResultStatus != ResultStatus.Success.ToString())
         return StatusCode((int)HttpStatusCode.InternalServerError, result);

      return Ok(result);
   }
   [HttpPut("{employeeId}")]
   public async Task<IActionResult> UpdateEmployee([FromRoute] Guid employeeId,
      [FromBody] UpdateEmployeeRequest request)
   {
      var result = await _employeeService.UpdateEmployee(employeeId, request);

      if (result.ResultStatus != ResultStatus.Success.ToString())
         return StatusCode((int)HttpStatusCode.InternalServerError, result);

      return Ok(result);
   }
   [HttpDelete("delete-employee")]
   public async Task<ActionResult<Result<Employee>>> DeleteEmployee(Guid id)
   {
      var result = await _employeeService.DeleteEmployee(id);
      if (result.ResultStatus != ResultStatus.Success.ToString())
      {
         return StatusCode((int)HttpStatusCode.InternalServerError, result);
      }
      return Ok(result);
   }
}