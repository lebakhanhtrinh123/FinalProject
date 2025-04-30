using System.Net;
using BusinessObject.DTO.Commons;
using BusinessObject.DTO.Customer;
using BusinessObject.Entities;
using Microsoft.AspNetCore.Mvc;
using Service.Interface;

namespace WebAPI.Controllers;
[Route("api/customers")]
[ApiController]
public class CustomerController : Controller
{
   private readonly ICustomerService _customerService;

   public CustomerController(ICustomerService customerService)
   {
      _customerService = customerService;
   }
  
   [HttpGet]
   public async Task<IActionResult> GetCustomer()
   {
      var result = await _customerService.GetAllCustomer();
      return Ok(result);
   }
   [HttpGet("Id")]
   public async Task<IActionResult> GetCustomerById(Guid id)
   {
      var result = await _customerService.GetCustomerById(id);

      if (result.ResultStatus != ResultStatus.Success.ToString())
         return StatusCode((int)HttpStatusCode.InternalServerError, result);

      return Ok(result);
   }
   [HttpPut("{customerId}")]
   public async Task<IActionResult> UpdateCustomer([FromRoute] Guid customerIdId,
      [FromBody] UpdateCustomerRequest request)
   {
      var result = await _customerService.UpdateCustomer(customerIdId, request);

      if (result.ResultStatus != ResultStatus.Success.ToString())
         return StatusCode((int)HttpStatusCode.InternalServerError, result);

      return Ok(result);
   }
   [HttpDelete("delete-customer")]
   public async Task<ActionResult<Result<Customer>>> DeleteCustomer(Guid id)
   {
      var result = await _customerService.DeleteCustomer(id);
      if (result.ResultStatus != ResultStatus.Success.ToString())
      {
         return StatusCode((int)HttpStatusCode.InternalServerError, result);
      }
      return Ok(result);
   }
}