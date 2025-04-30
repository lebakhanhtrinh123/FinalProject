using BusinessObject.Context;
using BusinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Interface;

namespace Repository.Implement;

public class RoleRepository : IRoleRepository
{
    private readonly CustomFlowerChainContext _context;

    public RoleRepository(CustomFlowerChainContext context)
    {
        _context = context;
    }
    public async Task<Guid?> GetRoleIdByName(string rolename)
    {
        return await _context.Roles
            .Where(r => r.RoleName == rolename)
            .Select(r => r.RoleId)
            .FirstOrDefaultAsync();
    }
}