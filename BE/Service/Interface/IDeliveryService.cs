using BusinessObject.DTO.Delivery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interface
{
    public interface IDeliveryService
    {
        Task CreateDelivery(DeliveryRequest deliveryRequest, Guid OrderId );
        Task<IEnumerable<DeliveryResponse>> GetDeliveryByShipperId( Guid shipperId );
        Task<DeliveryResponse> GetDeliveryById(Guid DeliveryId);
        Task UpdateDeliveryByShipperId(UpdateDeliveryByShipperResponse updateDeliveryByShipperResponse,Guid DeliveryId);
        Task UpdateDeliveryByStaffId(DeliveryRequest deliveryRequest, Guid DeliveryId);

    }
}
