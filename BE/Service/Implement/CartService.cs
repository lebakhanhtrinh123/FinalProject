using BusinessObject.DTO.Cart;
using BusinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Interface;
using Service.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Implement
{
    public class CartService : ICartService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CartService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task AddToCart(Guid customerID, Guid ProductID, int Quantity)
        {
            // Kiểm tra xem customer có tồn tại không
            var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(customerID);
            if (customer == null)
            {
                throw new Exception("Customer not found");
            }

            // Kiểm tra xem product có tồn tại không
            var product = await _unitOfWork.Repository<Product>().GetByIdAsync(ProductID);
            if (product == null)
            {
                throw new Exception("Product not found");
            }

            // Kiểm tra xem sản phẩm đã có trong giỏ hàng hay chưa
            var existingCartItem = await _unitOfWork.Repository<Cart>()
                .Entities
                .FirstOrDefaultAsync(c => c.CustomerId == customerID && c.ProductId == ProductID);

            if (existingCartItem != null)
            {
                // Nếu sản phẩm đã có trong giỏ hàng, cộng thêm Quantity và cập nhật ProductTotalPrice
                existingCartItem.Quantity += Quantity;
                existingCartItem.ProductTotalPrice =
                    (product.Price - (product.Price * product.Discount) / 100) * existingCartItem.Quantity;

                _unitOfWork.Repository<Cart>().Update(existingCartItem);
            }
            else
            {
                // Nếu sản phẩm chưa có trong giỏ hàng, thêm sản phẩm mới
                var cart = new Cart
                {
                    CustomerId = customerID,
                    ProductId = ProductID,
                    Quantity = Quantity,
                    StoreId = product.StoreId,
                    ProductTotalPrice = (product.Price - (product.Price * product.Discount) / 100) * Quantity,
                };

                await _unitOfWork.Repository<Cart>().AddAsync(cart);
            }

            // Lưu thay đổi vào database
            await _unitOfWork.CompleteAsync();
        }


        public Task DeleteCartByProductID(Guid customerId, Guid productId)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<CartResponse>> GetCartByUserId(Guid customerID)
        {
            var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(customerID);
            if (customer == null)
            {
                throw new Exception("Customer not found");
            }
            var carts = await _unitOfWork.Repository<Cart>().Entities.Include(x => x.Product).Where(d => d.CustomerId == customerID).ToListAsync();
            var productImage = await _unitOfWork.Repository<ProductImage>().GetAllAsync();

            var carResponse = carts.Select(cart => new CartResponse
            {
                CartId = cart.CartId,
                CustomerId = customerID,
                ProductId = cart.ProductId, 
                Quantity = cart.Quantity,
                ProductName = cart.Product.ProductName,
                ProductImage = productImage.Where(pi => pi.ProductId == cart.ProductId)
                                                             .Select(pi => pi.ProductImage1)
                                                            .FirstOrDefault(),
                ProductPrice = cart.Product.Price,
                TotalPrice = cart.ProductTotalPrice,
               
            }).ToList();
            return carResponse;
        }

        public async Task RemoveByCartID(Guid cartId)
        {
            var cart = await _unitOfWork.Repository<Cart>().GetByIdAsync(cartId);
            _unitOfWork.Repository<Cart>().Delete(cart);
            await _unitOfWork.CompleteAsync();  
        }

        public async Task RemoveCart(Guid userId)
        {
            var cart = (await _unitOfWork.Repository<Cart>().GetAllAsync()).Where(d =>d.CustomerId == userId);
            _unitOfWork.Repository<Cart>().DeleteRange(cart);
            await _unitOfWork.CompleteAsync();
        }

        public async Task UpdateQuantityAsync(Guid cartId, int quantity)
        {
            var cart = await _unitOfWork.Repository<Cart>().GetByIdAsync(cartId);
            if (quantity > 0)
            {
                cart.Quantity = quantity;
                cart.ProductTotalPrice = (cart.Product.Price - (cart.Product.Price * cart.Product.Discount) / 100) * quantity;
                _unitOfWork.Repository<Cart>().Update(cart);
                await _unitOfWork.CompleteAsync();
            }
            else
            {
                throw new Exception("Quantity must be greater than 0");
            }
            _unitOfWork.Repository<Cart>().Update(cart);
            await _unitOfWork.CompleteAsync();

        }
    }
}
