import React, { useEffect, useRef, useState } from 'react';
import { Card, Spin, message } from 'antd';
import { Link } from 'react-router-dom';
import { RightCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const ProductCarousel = () => {
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Product/GetAllProduct');

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Filter for featured/bestseller products
          const bestSellers = response.data.data
            .filter(product => product.featured)
            .map(product => ({
              id: product.productId,
              name: product.productName,
              price: product.price,
              image: product.productImages && product.productImages.length > 0
                ? product.productImages[0].productImage1
                : 'https://via.placeholder.com/300',
              discount: product.discount,
            }));

          setBestSellerProducts(bestSellers);
        } else {
          console.error("Unexpected data format:", response.data);
          setBestSellerProducts([]);
          message.error("Failed to parse bestseller data");
        }
      } catch (error) {
        console.error("Error fetching bestsellers:", error);
        message.error("Failed to load bestsellers. Please try again later.");
        setBestSellerProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  useEffect(() => {
    // Animation effect for continuous scrolling
    if (carouselRef.current && bestSellerProducts.length > 0) {
      const scrollAnimation = () => {
        const container = carouselRef.current;
        if (container) {
          // If we've scrolled to the end, reset to beginning
          if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
            container.scrollLeft = 0;
          } else {
            container.scrollLeft += 1; // Smooth scrolling speed
          }
        }
      };

      const animationInterval = setInterval(scrollAnimation, 30);
      return () => clearInterval(animationInterval);
    }
  }, [bestSellerProducts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spin size="large" tip="Loading best sellers..." />
      </div>
    );
  }

  if (bestSellerProducts.length === 0) {
    return null; // Don't show the component if no bestsellers
  }

  return (
    <div className="my-8 p-4 bg-pink-50 rounded-lg">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold text-pink-600">Best Sellers</h2>
        <RightCircleOutlined className="ml-2 text-pink-600 text-xl" />
      </div>
      
      <div
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide gap-4"
        style={{ 
          scrollBehavior: 'smooth', 
          msOverflowStyle: 'none', 
          scrollbarWidth: 'none' 
        }}
      >
        {/* Duplicate products to create endless scroll effect */}
        {[...bestSellerProducts, ...bestSellerProducts].map((product, index) => (
          <div key={`${product.id}-${index}`} className="flex-shrink-0" style={{ width: '220px' }}>
            <Link to={`/productdetail/${product.id}`}>
              <Card
                hoverable
                cover={
                  <div className="relative">
                    <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 z-10 text-sm font-semibold">
                      BEST SELLER
                    </div>
                    <img 
                      alt={product.name} 
                      src={product.image} 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                }
                bodyStyle={{ padding: '12px' }}
              >
                <div className="text-center">
                  <h3 className="text-base font-medium mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-pink-600 font-semibold">
                    {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()} VND
                  </p>
                  <p className="flex justify-center items-center mb-1">
                    <span className="text-xs text-gray-500 line-through">
                      {product.price.toLocaleString()} VNĐ
                    </span>
                    <span className="text-xs ml-2 text-pink-600 font-semibold">
                      {product.discount}%
                    </span>
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      {/* Custom scrollbar styling */}
      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductCarousel;