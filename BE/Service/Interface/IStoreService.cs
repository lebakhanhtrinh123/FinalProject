 using BusinessObject.DTO.Request;
using BusinessObject.DTO.Response;
using MailKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interface
{
    public interface IStoreService
    {
        Task<IEnumerable<StoreResponse>> GetStore();
        Task AddStore(StoreRequest storeRequest);
        Task UpdateStore(StoreRequest storeRequest, Guid id);
        Task DeleteStore(Guid id);
        Task<StoreResponse> GetStoreById(Guid id);

    }
}
