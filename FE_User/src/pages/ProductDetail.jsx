import React, { useState, useEffect } from 'react';
import { Button, Input, Rate, List, InputNumber, Tag, Card, Row, Col, Empty, message } from 'antd';
import { ArrowLeftOutlined, UserOutlined, ShoppingCartOutlined, WalletOutlined, FileImageOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Divider } from 'antd';
import ProductCommitment from "../components/ProductCommitment";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Product/GetProductById?id=${id}`);
        console.log("Product data:", response.data.data);
        setProduct(response.data.data);

        if (response.data.data) {
          fetchRelatedProducts(response.data.data.categoryName, response.data.data.productId);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/comment/get-comments-by-productId?productId=${id}`);
        setComments(response.data.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchProductDetail();
    fetchComments();
  }, [id]);

  const fetchRelatedProducts = async (categoryName, currentProductId) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Product/GetAllProduct`);
      console.log("All products:", response.data.data);

      if (categoryName) {
        const filtered = response.data.data.filter(prod =>
          prod.categoryName === categoryName && prod.productId !== currentProductId
        );

        console.log("Related products:", filtered);
        setRelatedProducts(filtered);
      } else {
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
      setRelatedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
    }
  }, [product]);

  const fetchCustomer = async () => {
    try {
      const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/customers');
      const currentCustomer = response.data[0];
      return currentCustomer.customerId;
    } catch (error) {
      console.error("Error fetching customer info:", error);
    }
  };

  const handleSubmit = async () => {
    if (text.trim() !== '') {
      try {
        const customerId = await fetchCustomer();

        const newComment = {
          productId: id,
          customerId: customerId,
          rating: rating,
          feedback: text,
          status: true
        };

        const response = await axios.post('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/comment/create-comment', newComment);

        setComments([...comments, response.data.data]);
        setText('');
        setRating(0);
      } catch (error) {
        console.error("Error submitting comment:", error);
      }
    }
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleAddToCart = async () => {
    try {
      // Kiểm tra đăng nhập và lấy token
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        message.error('Please login to add items to cart');
        navigate('/login');
        return;
      }

      // Decode JWT để lấy customerId
      const decodedToken = jwtDecode(token);
      const customerId = decodedToken.Id;

      if (!customerId) {
        message.error('User information not found. Please login again');
        navigate('/login');
        return;
      }

      // Gọi API thêm vào giỏ hàng
      const response = await axios.post(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Cart/CreateCart?customerID=${customerId}&ProductID=${id}&Quantity=${quantity}`,
        {},  // empty body
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Cart response:', response.data); // Để debug

      if (response.status === 200) {
        message.success('Product added to cart successfully!');
      } else {
        message.error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error.response?.data || error);
      message.error(error.response?.data?.messages?.join(', ') || 'Failed to add product to cart. Please try again.');
    }
  };

  // Navigate to other product
  const navigateToProduct = (productId) => {
    navigate(`/productdetail/${productId}`);
    window.location.reload();
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-pink-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-pink-50 py-2">
      <Header />

      <div className="flex ml-20 mt-10 mb-4">
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          className="bg-pink-300 text-white text-lg px-6 py-5 rounded-md shadow-md"
          onClick={() => navigate(-1)}
        >
          BACK
        </Button>
      </div>

      <div className="mx-20 my-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-10">
          <div>
            <div className="w-full h-auto flex items-center justify-center rounded-lg overflow-hidden">
              <img
                src={product.productImages[selectedImageIndex]?.productImage1}
                alt={product.productName}
                className="w-3/4 h-auto object-cover rounded-lg"
              />
            </div>
            <div className="flex items-center justify-center rounded-lg overflow-hidden gap-4 mt-10">
              {product.productImages.map((image, index) => (
                <img
                  key={index}
                  src={image.productImage1}
                  alt={`Thumbnail ${index + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${selectedImageIndex === index ? 'border-pink-600' : 'border-pink-400'
                    }`}
                  onClick={() => handleThumbnailClick(index)}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-pink-200 h-full overflow-y-auto">
            <div className="flex items-center mb-6">
              <div className="w-1 h-6 bg-pink-500 mr-3"></div>
              <h2 className="text-xl font-bold text-left">Product Information</h2>
            </div>
            <div className="px-10">
              <h1 className="text-5xl text-left font-bold mb-8">{product.productName}</h1>
              <div className="flex gap-2 mb-8">
                <Tag color="green">Category: {product.categoryName || "Uncategorized"}</Tag>
              </div>
              <div className="flex items-center gap-5 mb-8">
                <Rate disabled defaultValue={0} />
                <span>(No reviews)</span>
              </div>
              <div className="flex gap-5 mb-4">
                <h2 className="text-xl font-bold">Price:</h2>
                <div className="text-left flex flex-col">
                  <span className="text-xl text-pink-600 font-semibold">
                    {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()} VNĐ
                  </span>
                  <div className="flex flex-row gap-2">
                    <span className="text-sm text-gray-500 line-through">{product.price.toLocaleString()} VNĐ</span>
                    <span className="text-sm text-pink-600 font-semibold">{product.discount}%</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-5 mb-4">
                <h2 className="text-xl font-bold">Size:</h2>
                <span className="text-xl text-gray-600">{product.size}</span>
              </div>
              <div className="flex gap-5 mb-4">
                <h2 className="text-xl font-bold">Weight:</h2>
                <span className="text-xl text-gray-600">{product.weight || "N/A"}kg</span>
              </div>
              <div className="flex gap-5 mb-4">
                <h2 className="text-xl font-bold">Sold:</h2>
                <span className="text-xl text-gray-600">{product.sold}</span>
              </div>
              <div className="flex items-center gap-5">
                <h2 className="text-left text-xl font-bold">Quantity:</h2>
                <InputNumber 
                  min={1} 
                  defaultValue={1} 
                  value={quantity}
                  onChange={(value) => setQuantity(value)}
                  className="border-pink-400 rounded-md" 
                />
              </div>
              <div className="flex items-center gap-4 mt-10">
                <Button
                  type="primary"
                  className="bg-pink-400 text-white text-xl px-10 py-6 rounded-md"
                  onClick={handleAddToCart}
                >
                  ADD TO CART <ShoppingCartOutlined />
                </Button>
                <Button
                  type="primary"
                  className="bg-pink-600 text-white text-xl px-10 py-6 rounded-md hover:bg-pink-800"
                  onClick={() => navigate('/checkout', {
                    state: {
                      product: {
                        ...product,
                        productId: id,
                        selectedQuantity: quantity,
                        finalPrice: Math.round(product.price * (1 - product.discount / 100)),
                        totalPrice: Math.round(product.price * (1 - product.discount / 100)) * quantity
                      }
                    }
                  })}
                >
                  BUY NOW <WalletOutlined />
                </Button>
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <ProductCommitment />

          <div className="bg-white rounded-lg p-6 border border-pink-200 h-full overflow-y-auto">
            <div className="flex items-center mb-3">
              <div className="w-1 h-6 bg-pink-500 mr-3"></div>
              <h2 className="text-xl font-bold text-left">Product Description</h2>
            </div>

            <div className="text-left">
              <p className="text-left text-gray-600 mb-3">{product.description}</p>


              <Divider className="my-4 border-pink-500" />
              <div className="bg-pink-200 p-3 rounded-md flex items-start">
                <FileImageOutlined className="text-lg mr-2 text-pink-600 mt-1" />
                <span className="text-gray-700">Commitment to product images are real photos.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-3xl text-left font-bold mb-4">Customer Reviews</h2>
          <div className="bg-white mb-6 p-6 bg-pink-50 text-left border rounded-md">
            <div className="flex items-center mb-3">
              <div className="w-1 h-6 bg-pink-500 mr-3"></div>
              <h2 className="text-xl font-bold text-left">Leave your feedback about this product</h2>
            </div>
            <h3 className="text-lg text-left font-semibold mb-1">Rating: <Rate onChange={setRating} value={rating} className="mb-2" /></h3>
            <h3 className="text-lg font-semibold mb-3">Comment:</h3>
            <Input.TextArea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your review here..."
            />
            <Button type="primary" className="mt-3 bg-pink-400 text-white" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
          <List
            className="text-left"
            itemLayout="horizontal"
            dataSource={comments}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<UserOutlined className="text-2xl" />}
                  title={<>{item.customerName || "Anonymous"} <Rate disabled defaultValue={item.rating} /></>}
                  description={item.feedback}
                />
              </List.Item>
            )}
          />
        </div>

        <div className="mt-10">
          <h2 className="text-3xl text-left font-bold mb-8">Related Products</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : relatedProducts.length > 0 ? (
            <Row gutter={[24, 24]}>
              {relatedProducts.map((relatedProduct) => (
                <Col key={relatedProduct.productId} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    cover={
                      <div className="h-48 overflow-hidden relative">
                        {relatedProduct.featured && (
                          <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 z-10 text-sm font-semibold">
                            BEST SELLER
                          </div>
                        )}
                        {relatedProduct.productImages && relatedProduct.productImages.length > 0 ? (
                          <img
                            alt={relatedProduct.productName}
                            src={relatedProduct.productImages[0]?.productImage1}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                    }
                    className="border border-pink-200 transition-all hover:shadow-lg hover:border-pink-400"
                    onClick={() => navigateToProduct(relatedProduct.productId)}
                  >
                    <Card.Meta
                      title={
                        <div className="truncate text-lg font-semibold">{relatedProduct.productName}</div>
                      }
                      description={
                        <div>
                          <div className="flex justify-between text-gray-500">
                            <div className="text-left flex flex-col">
                              <span>Size: {relatedProduct.size || "N/A"}</span>
                              <span>{relatedProduct.sold} sold</span>
                            </div>
                            <div className="text-left flex flex-col">
                              <span className="text-pink-600 font-semibold">
                                {Math.round(relatedProduct.price * (1 - relatedProduct.discount / 100)).toLocaleString()} VNĐ
                              </span>
                              <div className="flex flex-row gap-2">
                                <span className="text-gray-500 line-through">{relatedProduct.price.toLocaleString()} VNĐ</span>
                                <span className="text-pink-600 font-semibold">{relatedProduct.discount}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description={
                <span className="text-gray-500">
                  {product.categoryName
                    ? "Không tìm thấy sản phẩm tương tự trong danh mục này."
                    : "Sản phẩm này chưa được gán danh mục."
                  }
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-10"
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;