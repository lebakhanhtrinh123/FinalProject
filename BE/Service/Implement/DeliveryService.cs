using BusinessObject.DTO.Delivery;
using BusinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Implement;
using Repository.Interface;
using Service.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Implement
{
    public class DeliveryService : IDeliveryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeliveryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task CreateDelivery(DeliveryRequest deliveryRequest, Guid OrderId)
        {
            // Lấy thông tin order
            var order = await _unitOfWork.Repository<Order>()
                                         .Entities
                                         .Include(o => o.Customer) // Bao gồm thông tin Customer
                                         .FirstOrDefaultAsync(o => o.OrderId == OrderId);

            if (order == null)
            {
                throw new Exception($"Order with ID {OrderId} not found.");
            }

            // Kiểm tra thông tin khách hàng
            if (order.Customer == null)
            {
                throw new Exception("Customer information is missing for this order.");
            }

            // Tạo thông tin giao hàng
            var delivery = new Delivery
            {
                OrderId = OrderId,
                ShipperId = deliveryRequest.ShipperId,
                FreeShip = deliveryRequest.FreeShip,
                note = deliveryRequest.note,
                Fee = deliveryRequest.Fee,
                PickupLocation = deliveryRequest.PickupLocation,
                CustomerName = order.Customer.FullName,
                CustomerPhone = order.Customer.Phone,
                DeliveryLocation = string.Join(", ", order.DeliveryAddress, order.DeliveryDistrict, order.DeliveryCity),
                DeliveryTime = order.DeliveryDateTime,
                Status = "Bắt đầu giao",
            };

            // Lưu vào database
            await _unitOfWork.Repository<Delivery>().AddAsync(delivery);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<DeliveryResponse> GetDeliveryById(Guid DeliveryId)
        {
            var delivery = await _unitOfWork.Repository<Delivery>().GetByIdAsync(DeliveryId);
            if (delivery == null)
            {
                throw new KeyNotFoundException("Delivery not found");

            }
            var deliveryResponse = new DeliveryResponse
            {
                DeliveryId = delivery.DeliveryId,
                OrderId = delivery.OrderId,
                ShipperId = delivery.ShipperId,
                FreeShip = delivery.FreeShip,
                Fee = delivery.Fee,
                Note = delivery.note,
                PickupLocation = delivery.PickupLocation,
                CustomerName = delivery.CustomerName,
                CustomerPhone = delivery.CustomerPhone,
                DeliveryLocation = delivery.DeliveryLocation,
                DeliveryTime = delivery.DeliveryTime,
                TimeDone = delivery.TimeDone,
                DeliveryImage = delivery.DeliveryImage,
                Status = delivery.Status,

            };
            return deliveryResponse;

        }

        public async Task<IEnumerable<DeliveryResponse>> GetDeliveryByShipperId(Guid shipperId)
        {
            var deliverys = (await _unitOfWork.Repository<Delivery>().GetAllAsync()).Where(n => n.ShipperId == shipperId);
            var deliveryResponse = deliverys.Select(delivery => new DeliveryResponse
            {
                DeliveryId = delivery.DeliveryId,
                OrderId = delivery.OrderId,
                ShipperId = delivery.ShipperId,
                FreeShip = delivery.FreeShip,
                Fee = delivery.Fee,
                Note = delivery.note,
                PickupLocation = delivery.PickupLocation,
                CustomerName = delivery.CustomerName,
                CustomerPhone = delivery.CustomerPhone,
                DeliveryLocation = delivery.DeliveryLocation,
                DeliveryTime = delivery.DeliveryTime,
                TimeDone = delivery.TimeDone,
                DeliveryImage = delivery.DeliveryImage,
                Status = delivery.Status,
            }).ToList();    
            return deliveryResponse;
        }

        public async Task UpdateDeliveryByShipperId(UpdateDeliveryByShipperResponse updateDeliveryByShipperResponse, Guid DeliveryId)
        {
            var delivery = await _unitOfWork.Repository<Delivery>().GetByIdAsync(DeliveryId);
            if (delivery == null)
            {
                throw new KeyNotFoundException("Delivery not found");
            }
            delivery.TimeDone = updateDeliveryByShipperResponse.TimeDone;
            delivery.DeliveryImage = updateDeliveryByShipperResponse.DeliveryImage;
            delivery.Status = updateDeliveryByShipperResponse.Status;   
            _unitOfWork.Repository<Delivery>().Update(delivery);
            await _unitOfWork.CompleteAsync();
        }

        public async Task UpdateDeliveryByStaffId(DeliveryRequest deliveryRequest, Guid DeliveryId)
        {
            var delivery = await _unitOfWork.Repository<Delivery>().GetByIdAsync(DeliveryId);
            if (delivery == null)
            {
                throw new KeyNotFoundException("Delivery not found");
            }
            delivery.FreeShip = deliveryRequest.FreeShip;   
            delivery.Fee = deliveryRequest.Fee; 
            delivery.PickupLocation = deliveryRequest.PickupLocation;
            delivery.ShipperId = deliveryRequest.ShipperId;
            delivery.note = deliveryRequest.note;
        }
    }
}
