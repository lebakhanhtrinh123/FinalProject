using BusinessObject.DTO.Product;
using BusinessObject.DTO.ProductImages;
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
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ProductService(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;
        }

        public async Task CreateProduct(ProductRequest productRequest, Guid StoreId)
        {
            var product = new Product
            {
                ProductName = productRequest.ProductName,
                Quantity = productRequest.Quantity,
                Price = productRequest.Price,
                Size = productRequest.Size,
                StoreId = StoreId,
                Discount = productRequest.Discount,
                Description = productRequest.Description,
                Featured = productRequest.Featured,
                CategoryId = productRequest.CategoryId,
                Status = true,
                CreateAt = DateTime.Now,

            };
            await _unitOfWork.Repository<Product>().AddAsync(product);
            await _unitOfWork.CompleteAsync();
            if (productRequest.Images != null && productRequest.Images.Any())
            {
                var productImages = productRequest.Images.Select(imageRequest => new ProductImage
                {
                    ProductImage1 = imageRequest.ProductImage1,
                    ProductId = product.ProductId,
                    CreateAt = DateTime.Now,
                    Status = true
                }).ToList();
                await _unitOfWork.Repository<ProductImage>().AddRangeAsync(productImages);
                await _unitOfWork.CompleteAsync();
            }
        }

        public async Task DeleteProduct(Guid ProductId)
        {
            var product = await _unitOfWork.Repository<Product>().GetByIdAsync(ProductId);
            if (product == null)
            {
                throw new KeyNotFoundException("product not found");
            }
            _unitOfWork.Repository<Product>().Delete(product);
            var allImages = await _unitOfWork.Repository<ProductImage>().GetAllAsync();
            var ProductImages = allImages.Where(image => image.ProductId == product.ProductId);
            _unitOfWork.Repository<ProductImage>().DeleteRange(ProductImages);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<ProductResponse> GetProductById(Guid id)
        {
            var product = (await _unitOfWork.Repository<Product>().GetByIdAsync(id));
            var allImages = await _unitOfWork.Repository<ProductImage>().GetAllAsync();

            var productResponse = new ProductResponse{
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                StoreId = product.StoreId,
                Quantity = product.Quantity,
                CreateAt = DateTime.Now,
                UpdateAt = DateTime.Now,
                Size = product.Size,
                Discount = product.Discount,
                Description = product.Description,
                Featured = product.Featured,
                CategoryName = product.Category?.CategoryName,
                Sold = product.Sold,
                Status = product.Status,
                ProductImages = allImages.Where(image => image.ProductId == product.ProductId)
                                         .Select(image => new ProductImagesResponse
                                         {
                                             ProductImageId = image.ProductImageId,
                                             ProductImage1 = image.ProductImage1,
                                             CreateAt = image.CreateAt,
                                             UpdateAt = image.UpdateAt,
                                             Status = image.Status,
                                         }).ToList()
            };

            return productResponse;
        }

    

        public async Task<IEnumerable<ProductResponse>> GetProducts()
        {
            var products = await _unitOfWork.Repository<Product>().GetAllAsync();
            var allImages = await _unitOfWork.Repository<ProductImage>().GetAllAsync();

            var productResponse = products.Select(product => new ProductResponse
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                StoreId = product.StoreId,
                Quantity = product.Quantity,
                CreateAt = DateTime.Now,
                UpdateAt = DateTime.Now,
                Size = product.Size,
                Discount = product.Discount,
                Description = product.Description,
                Featured = product.Featured,
                CategoryName = product.Category?.CategoryName,
                Sold = product.Sold,
                Status = product.Status,
                ProductImages = allImages.Where(image => image.ProductId == product.ProductId)
                                         .Select(image => new ProductImagesResponse
                                         {
                                             ProductImageId = image.ProductImageId,
                                             ProductImage1 = image.ProductImage1,
                                             CreateAt = image.CreateAt,
                                             UpdateAt = image.UpdateAt,
                                             Status = image.Status,
                                         }).ToList()
            });

            return productResponse;
        }

        public async Task<IEnumerable<ProductResponse>> GetProductsByStoreId(Guid StoreId)
        {
            var products = (await _unitOfWork.Repository<Product>().GetAllAsync()).Where(product => product.StoreId == StoreId);

            var allImages = await _unitOfWork.Repository<ProductImage>().GetAllAsync();

            var productResponse = products.Select(product => new ProductResponse
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                StoreId = product.StoreId,
                Quantity = product.Quantity,
                CreateAt = DateTime.Now,
                UpdateAt = DateTime.Now,
                Size = product.Size,
                Discount = product.Discount,
                Description = product.Description,
                Featured = product.Featured,
                CategoryName = product.Category?.CategoryName,
                Sold = product.Sold,
                Status = product.Status,
                ProductImages = allImages.Where(image => image.ProductId == product.ProductId)
                                         .Select(image => new ProductImagesResponse
                                         {
                                             ProductImageId = image.ProductImageId,
                                             ProductImage1 = image.ProductImage1,
                                             CreateAt = image.CreateAt,
                                             UpdateAt = image.UpdateAt,
                                             Status = image.Status,
                                         }).ToList()
            });

            return productResponse;
        }

        public async Task UpdateProduct(UpdateProductRequest updateProductRequest, Guid ProductId)
        {
            var product = await _unitOfWork.Repository<Product>().GetByIdAsync(ProductId);
            if (product == null)
            {
                throw new KeyNotFoundException("Product not found");
            }
            product.ProductName = updateProductRequest.ProductName ?? product.ProductName; 
            product.Quantity = updateProductRequest.Quantity?? product.Quantity;
            product.Description = updateProductRequest.Description ?? product.Description;
            product.Price= updateProductRequest.Price?? product.Price   ;
            product.Size = updateProductRequest.Size ?? product.Size;
            product.Discount = updateProductRequest.Discount ?? product.Discount;
            product.Featured = updateProductRequest.Featured ?? product.Featured;
            product.CategoryId = updateProductRequest.CategoryId ?? product.CategoryId;
            product.Status = updateProductRequest.Status ?? product.Status;
            product.UpdateAt = DateTime.Now;
            _unitOfWork.Repository<Product>().Update(product);
            await _unitOfWork.CompleteAsync();
        }
    }
}
