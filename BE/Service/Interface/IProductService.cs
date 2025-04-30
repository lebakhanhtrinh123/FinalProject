using BusinessObject.DTO.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interface
{
    public interface IProductService
    {
        Task<IEnumerable<ProductResponse>> GetProducts();
        Task<IEnumerable<ProductResponse>> GetProductsByStoreId(Guid StoreId);
        Task<ProductResponse> GetProductById(Guid id);
        Task CreateProduct(ProductRequest productRequest, Guid StoreId);
        Task UpdateProduct(UpdateProductRequest updateProductRequest, Guid ProductId);
        Task DeleteProduct(Guid ProductId);
    }
}
