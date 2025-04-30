using BusinessObject.DTO.Response;
using BusinessObject.DTO.Role;
using BusinessObject.Entities;
using Repository.Interface;
using Service.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Implement
{
    public class RoleService : IRoleService
    {
        public readonly IUnitOfWork _unitOfWork;

        public RoleService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task CreateRole(RoleRequest request)
        {
            var Role = new Role
            {
                RoleName = request.RoleName,
                Status = request.Status,    
            };
            await _unitOfWork.Repository<Role>().AddAsync(Role);    
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteRole(Guid id)
        {
            var role = await _unitOfWork.Repository<Role>().GetByIdAsync(id);
            if (role == null)
            {
                throw new KeyNotFoundException("role not found");
            }
            _unitOfWork.Repository<Role>().Delete(role);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<IEnumerable<RoleResponse>> GetAllRole()
        {
            var roles = await _unitOfWork.Repository<Role>().GetAllAsync();
            var roleResponse = roles.Select(role => new RoleResponse
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName,
                Status = role.Status,   
            });
            return roleResponse;
        }

        public async Task<RoleResponse> GetRoleById(Guid id)
        {
            var role = await _unitOfWork.Repository<Role>().GetByIdAsync(id);
            if(role == null)
            {
                throw new KeyNotFoundException("Role not found");
            }
            var roleResponse = new RoleResponse
            {
                RoleId = role.RoleId,
                RoleName= role.RoleName,    
                Status = role.Status,
            };
            return roleResponse;    
        }

        public async Task UpdateRole(RoleRequest request, Guid id)
        {
            var role = await _unitOfWork.Repository<Role>().GetByIdAsync(id);
            if(role == null)
            {
                throw new KeyNotFoundException("role not found");
            }
            role.RoleName = request.RoleName;
            role.Status = request.Status;
            _unitOfWork.Repository<Role>().Update(role);    
            await _unitOfWork.CompleteAsync();  
        }
    }
}
