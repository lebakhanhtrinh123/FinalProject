import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, message, Empty } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        message.error('Please login to view cart');
        navigate('/login');
        return;
      }

      const decodedToken = jwtDecode(token);
      const customerId = decodedToken.Id;

      const response = await axios.get(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Cart/GetCartByCustomer?customerID=${customerId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.data) {
        setCartItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      message.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (cartId, newQuantity) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await axios.put(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Cart/UpdateQuantity?cartId=${cartId}&quantity=${newQuantity}`,
        {},  // empty body for PUT request
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        message.success('Quantity updated successfully');
        fetchCartItems(); // Refresh cart items
      } else {
        message.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      message.error('Failed to update quantity');
    }
  };

  const handleDeleteItem = async (cartId) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await axios.delete(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Cart/RemoveByCartID?cartId=${cartId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        message.success('Item removed from cart successfully');
        fetchCartItems(); // Refresh cart items
      } else {
        message.error('Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      message.error('Failed to remove item from cart');
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'productImage',
      key: 'productImage',
      render: (image, record) => (
        <div className="flex items-center gap-4">
          <img
            src={image}
            alt={record.productName}
            className="w-20 h-20 object-cover rounded-md"
          />
          <span className="font-medium text-lg">{record.productName}</span>
        </div>
      ),
    },
    // {
    //   title: 'Price',
    //   dataIndex: 'productPrice',
    //   key: 'productPrice',
    //   render: (price) => (
    //     <span className="text-pink-600 font-semibold">
    //       {price.toLocaleString()} VNĐ
    //     </span>
    //   ),
    // },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.cartId, value)}
          className="border-pink-400"
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (total) => (
        <span className="text-pink-600 font-semibold">
          {total.toLocaleString()} VNĐ
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(record.cartId)}
        >
          Remove
        </Button>
      ),
    },
  ];

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <div className="bg-pink-50 flex flex-col min-h-screen">
      <Header />

      <div className="flex ml-20 mt-10">
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          className="bg-pink-300 text-white text-lg px-6 py-5 rounded-md shadow-md"
          onClick={() => navigate(-1)}
        >
          BACK
        </Button>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full py-8 px-4">
        <h1 className="text-center text-6xl font-bold text-pink-600 p-3 rounded mb-10">Shopping Cart</h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : cartItems.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <Table
              columns={columns}
              dataSource={cartItems}
              pagination={false}
              rowKey="cartId"
            />

            <div className="mt-8 flex justify-end items-center gap-8">
              <div className="text-xl">
                Total: <span className="text-pink-600 font-bold">{calculateTotal().toLocaleString()} VNĐ</span>
              </div>
              <Button
                type="primary"
                size="large"
                className="bg-pink-600 hover:bg-pink-700"
                onClick={() => navigate('/checkout-cart', {
                  state: {
                    cartItems: cartItems,
                    totalAmount: calculateTotal()
                  }
                })}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        ) : (
          <Empty
            description={
              <span className="text-gray-500">Your cart is empty</span>
            }
          >
            <Button
              type="primary"
              className="bg-pink-600 hover:bg-pink-700"
              onClick={() => navigate('/product')}
            >
              Continue Shopping
            </Button>
          </Empty>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ShoppingCart;
