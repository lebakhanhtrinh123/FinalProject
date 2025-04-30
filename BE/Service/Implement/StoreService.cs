using BusinessObject.DTO.Request;
using BusinessObject.DTO.Response;
using BusinessObject.Entities;
using MailKit;
using Repository.Interface;
using Service.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Implement
{
    public class StoreService : IStoreService
    {
        private readonly IUnitOfWork _unitOfWork;

        public StoreService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<IEnumerable<StoreResponse>> GetStore()
        {
            var stores =  await _unitOfWork.Repository<Store>().GetAllAsync();
            var storeResponse = stores.Select(store => new StoreResponse
            {
                StoreId = store.StoreId,
                StoreName = store.StoreName,
                City = store.City,
                District = store.District,
                Address = store.Address,
                StorePhone = store.StorePhone,
                StoreAvatar = store.StoreAvatar,
                StoreEmail = store.StoreEmail,
                CreateAt = store.CreateAt,
                UpdateAt = store.UpdateAt,
                Status = store.Status
            });
            return storeResponse;
        }
        public async Task<StoreResponse> GetStoreById(Guid id)
        {
            var store = await _unitOfWork.Repository<Store>().GetByIdAsync(id);
            if (store == null)
            {
                throw new KeyNotFoundException("Store not found");
            }
            var storeResponse = new StoreResponse
            {
                StoreId = store.StoreId,
                StoreName = store.StoreName,
                City = store.City,
                District = store.District,
                Address = store.Address,
                StorePhone = store.StorePhone,
                StoreAvatar = store.StoreAvatar,
                StoreEmail = store.StoreEmail,
                CreateAt = store.CreateAt,
                UpdateAt = store.UpdateAt,
                Status = store.Status
            };

            return storeResponse;
        }
        public async Task AddStore(StoreRequest storeRequest)
        {
            var store = new Store
            {
                StoreName = storeRequest.StoreName,
                City = storeRequest.City,
                District = storeRequest.District,
                Address = storeRequest.Address, 
                StorePhone = storeRequest.StorePhone,
                StoreAvatar = storeRequest.StoreAvatar,
                StoreEmail = storeRequest.StoreEmail,
                CreateAt = DateTime.Now,
                Status = true
            };
            await _unitOfWork.Repository<Store>().AddAsync(store);
            await _unitOfWork.CompleteAsync();

        }

        public async Task DeleteStore(Guid id)
        {
            var store = await _unitOfWork.Repository<Store>().GetByIdAsync(id);
            if (store == null)
            {
                throw new KeyNotFoundException("Store not found");
            }
            _unitOfWork.Repository<Store>().Delete(store);
            await _unitOfWork.CompleteAsync();
        }

        public async Task UpdateStore(StoreRequest storeRequest, Guid id)
        {
            var store = await _unitOfWork.Repository<Store>().GetByIdAsync(id);
            if (store == null)
            {
                throw new KeyNotFoundException("Store not found");
            }
            store.StoreName = storeRequest.StoreName ?? store.StoreName;  // Giữ nguyên nếu giá trị mới là null
            store.City = storeRequest.City ?? store.City;
            store.District = storeRequest.District ?? store.District;   
            store.Address = storeRequest.Address ?? store.Address;
            store.StorePhone = storeRequest.StorePhone ?? store.StorePhone;
            store.StoreAvatar = storeRequest.StoreAvatar ?? store.StoreAvatar;
            store.StoreEmail = storeRequest.StoreEmail ?? store.StoreEmail;
            store.Status = storeRequest.Status ?? store.Status;
            store.UpdateAt = DateTime.Now;
            _unitOfWork.Repository<Store>().Update(store);
            await _unitOfWork.CompleteAsync();

        }
    }
}
