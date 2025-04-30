using BusinessObject.Entities;

namespace Repository.Interface;

public interface IRoleRepository
{
    Task<Guid?> GetRoleIdByName(string rolename);
}