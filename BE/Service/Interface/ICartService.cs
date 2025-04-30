using BusinessObject.DTO.Cart;
using Org.BouncyCastle.Asn1.Cmp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interface
{
    public interface ICartService
    {
        Task AddToCart(Guid customerID, Guid ProductID, int Quantity);
        Task<IEnumerable<CartResponse>> GetCartByUserId(Guid customerID);
        Task RemoveCart(Guid userId);
       
        Task RemoveByCartID(Guid cartId);

        Task UpdateQuantityAsync(Guid cartId, int quantity);
    }
}
