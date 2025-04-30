using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessObject.DTO.Role;
namespace Service.Interface
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleResponse>> GetAllRole();
        Task<RoleResponse> GetRoleById(Guid id);
        Task CreateRole(RoleRequest request);
        Task DeleteRole(Guid id);
        Task UpdateRole(RoleRequest request, Guid id);
    }
}
