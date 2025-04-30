import React, { useState, useEffect, useRef } from 'react';
import { MessageOutlined, EyeOutlined, CreditCardOutlined, DeleteOutlined } from '@ant-design/icons';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import { message, Modal, Divider, Tag } from 'antd';
import { } from 'antd';
import axios from 'axios';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, XCircle, MessageSquareText, MessageCircle } from "lucide-react";

const WalletPage = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [failOrders, setFailOrders] = useState([]);
    const [refundOrders, setRefundOrders] = useState([]);

    const [cancelOrders, setCancelOrders] = useState([]);

    const [selectedStatus, setSelectedStatus] = useState('All');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        processing: 0,
        failed: 0
    });
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [feedbackData, setFeedbackData] = useState(null);
    const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
    const [isFeedbackInputModalVisible, setIsFeedbackInputModalVisible] = useState(false);

    // Thêm state mới để quản lý dialog xác nhận
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchOrders();
        fetchFailOrders();
        fetchCancelOrders();
        fetchRefundOrders();
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const shouldOpenChat = queryParams.get('openChat') === 'true';
        
        if (shouldOpenChat) {
            const orderIdParam = queryParams.get('orderId');
            const customerIdParam = queryParams.get('customerId');
            const employeeIdParam = queryParams.get('employeeId');
            
            if (orderIdParam && customerIdParam && employeeIdParam) {
                // Wait for orders to be loaded
                const checkAndOpenChat = () => {
                    // Search in all order lists
                    const allOrders = [...orders, ...failOrders, ...cancelOrders, ...refundOrders];
                    const matchedOrder = allOrders.find(order => 
                        order.orderId === orderIdParam && 
                        order.customerId === customerIdParam && 
                        order.staffId === employeeIdParam
                    );
                    
                    if (matchedOrder) {
                        setSelectedOrder(matchedOrder);
                        setIsChatModalOpen(true);
                        navigate('/wallet', { replace: true });
                    } else if (orders.length > 0 || failOrders.length > 0 || cancelOrders.length > 0 || refundOrders.length > 0) {
                        // If we have orders loaded but didn't find a match, we can create a temporary order object
                        const tempOrder = {
                            orderId: orderIdParam,
                            customerId: customerIdParam,
                            staffId: employeeIdParam
                        };
                        setSelectedOrder(tempOrder);
                        setIsChatModalOpen(true);
                        navigate('/wallet', { replace: true });
                    }
                };
                
                // Check immediately in case orders are already loaded
                checkAndOpenChat();
                
                // If orders aren't loaded yet, set up an interval to check
                const intervalId = setInterval(() => {
                    if (orders.length > 0 || failOrders.length > 0 || cancelOrders.length > 0 || refundOrders.length > 0) {
                        checkAndOpenChat();
                        clearInterval(intervalId);
                    }
                }, 500);
                
                // Clean up interval
                return () => clearInterval(intervalId);
            }
        }
    }, [location.search, orders, failOrders, cancelOrders, refundOrders]);
    
    const fetchOrders = async () => {
        try {
            // Get token from sessionStorage like in ShoppingCart
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                message.error('Please login to view orders');
                navigate('/login');
                return;
            }

            // Decode token to get customer ID
            const decodedToken = jwtDecode(token);
            const customerId = decodedToken.Id;  // Using Id from token like in ShoppingCart

            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetOrderByCustomer?CusomterId=${customerId}`);
            const data = await response.json();

            if (data.statusCode === 200) {
                const formattedOrders = data.data.map(order => ({
                    orderId: order.orderId,
                    staffId: order.staffId,
                    customerId: order.customerId,

                    // Thêm thông tin về ảnh
                    image : order.productCustomResponse
                    ? order.productCustomResponse.productCustomImage // Ảnh cho custom product
                    : order.orderDetails && order.orderDetails[0] // Kiểm tra orderDetails có tồn tại không
                    ? order.orderDetails[0].productImage // Ảnh cho normal product
                    : order.designCustomBuCustomerResponse // Kiểm tra designCustomBuCustomerResponse
                    ? order.designCustomBuCustomerResponse.responseImage // Ảnh cho design custom
                    : 'https://via.placeholder.com/150',
                     // ảnh cho normal product

                    // Thêm toàn bộ thông tin về productCustomResponse để dùng sau này
                    productCustomResponse: order.productCustomResponse,
                      // Thêm toàn bộ thông tin về productCustomResponse để dùng sau này
                      designCustomBuCustomerResponse: order.designCustomBuCustomerResponse,
                    // Thêm thông tin orderDetails để dùng sau này
                    orderDetails: order.orderDetails,

                    details: order.productCustomResponse ?
                        [order.productCustomResponse.productName] :
                        order.orderDetails.map(detail => detail.productName),
                    price: order.orderPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
                    payment: order.transfer ? "100% payment" : "50% deposit",
                    createAt: new Date(order.createAt).toLocaleString(),
                    date: new Date(order.deliveryDateTime).toLocaleString(),
                    status: order.status,
                    note: order.note,
                    phone: order.phone,
                    delivery: order.delivery ? "Shipping" : "Pickup",
                }));


                setOrders(formattedOrders);

                // Calculate statistics
                setStats({
                    total: formattedOrders.length,
                    completed: formattedOrders.filter(o => o.status === "Received").length,
                    processing: formattedOrders.filter(o =>
                        ["Arranging & Packing", "Awaiting Design Approval", "Flower Completed", "Delivery"].includes(o.status)
                    ).length,
                    fail:formattedOrders.filter(o => o.status === "Fail").length,

                });
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            message.error('Failed to load orders');
        }
    };
    const fetchFailOrders = async () => {
        try {
            // Get token from sessionStorage like in ShoppingCart
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                message.error('Please login to view orders');
                navigate('/login');
                return;
            }

            // Decode token to get customer ID
            const decodedToken = jwtDecode(token);
            const customerId = decodedToken.Id;  // Using Id from token like in ShoppingCart

            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetFailOrderByCustomer?CusomterId=${customerId}`);
            const data = await response.json();

            if (data.statusCode === 200) {
                const formattedOrders = data.data.map(order => ({
                    orderId: order.orderId,
                    details: order.productCustomResponse ?
                        [order.productCustomResponse.productName] :
                        order.orderDetails.map(detail => detail.productName),
                        price: order.orderPrice,
                        // price: order.orderPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),

                        payment: order.transfer ? "100% payment" : "50% deposit",
                    createAt: new Date(order.createAt).toLocaleString(),
                    date: new Date(order.deliveryDateTime).toLocaleString(),
                    status: order.status,
                    note: order.note,
                    phone: order.phone,
                    delivery: order.delivery ? "Shipping" : "Pickup",

                }));

                setFailOrders(formattedOrders);


            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            message.error('Failed to load orders');
        }
    };
    const fetchRefundOrders = async () => {
        try {
            // Get token from sessionStorage like in ShoppingCart
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                message.error('Please login to view orders');
                navigate('/login');
                return;
            }

            // Decode token to get customer ID
            const decodedToken = jwtDecode(token);
            const customerId = decodedToken.Id;  // Using Id from token like in ShoppingCart

            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetRefundOrderByCustomer?CusomterId=${customerId}`);
            const data = await response.json();

            if (data.statusCode === 200) {
                const formattedOrders = data.data.map(order => ({
                    orderId: order.orderId,
                    details: order.productCustomResponse ?
                        [order.productCustomResponse.productName] :
                        order.orderDetails.map(detail => detail.productName),
                        price: order.orderPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
                    payment: order.transfer ? "100% payment" : "50% deposit",
                    createAt: new Date(order.createAt).toLocaleString(),
                    date: new Date(order.deliveryDateTime).toLocaleString(),
                    status: order.status,
                    note: order.note,
                    phone: order.phone,
                    delivery: order.delivery ? "Shipping" : "Pickup",

                }));

                setRefundOrders(formattedOrders);


            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            message.error('Failed to load orders');
        }
    };
    const fetchCancelOrders = async () => {
        try {
            // Get token from sessionStorage like in ShoppingCart
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                message.error('Please login to view orders');
                navigate('/login');
                return;
            }
            // Decode token to get customer ID
            const decodedToken = jwtDecode(token);
            const customerId = decodedToken.Id;  // Using Id from token like in ShoppingCart

            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetCancelOrderByCustomer?CusomterId=${customerId}`);
            const data = await response.json();

            if (data.statusCode === 200) {
                const formattedOrders = data.data.map(order => ({
                    orderId: order.orderId,
                    details: order.productCustomResponse ?
                        [order.productCustomResponse.productName] :
                        order.orderDetails.map(detail => detail.productName),
                        price: order.orderPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
                    payment: order.transfer ? "100% payment" : "50% deposit",
                    createAt: new Date(order.createAt).toLocaleString(),
                    date: new Date(order.deliveryDateTime).toLocaleString(),
                    status: order.status,
                    note: order.note,
                    phone: order.phone,
                    delivery: order.delivery ? "Shipping" : "Pickup",

                }));

                setCancelOrders(formattedOrders);


            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            message.error('Failed to load orders');
        }
    };


    const getStatusColor = (status) => {
        const colors = {
            "Order Successfully": "text-green-600 bg-green-100",
            "Arranging & Packing": "text-pink-600 bg-pink-100",
            "Awaiting Design Approval": "text-yellow-600 bg-yellow-100",
            "Flower Completed": "text-orange-600 bg-orange-100",
            "Delivery": "text-purple-600 bg-purple-100",
            "Cancel": "text-red-600 bg-red-100",
            "Fail": "text-red-600 bg-red-100",
            "Received": "text-blue-600 bg-blue-100",
            "Refuse refund": "text-red-600 bg-red-100",
            "Accept refund": "text-green-600 bg-green-100",
            "Request refund": "text-yellow-600 bg-yellow-100",

            "đang xử lý": "text-blue-600 bg-blue-100",
        };
        return colors[status] || "text-gray-600 bg-gray-100";
    };

    const statusOptions = [
        'All',
        'Order Successfully',
        'Arranging & Packing',
        'Awaiting Design Approval',
        'Flower Completed',
        'Received',
        'đang xử lý',
        'thất bại'
    ];

    useEffect(() => {
        if (selectedStatus === 'All') {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter(order => order.status === selectedStatus);
            setFilteredOrders(filtered);
        }
    }, [selectedStatus, orders]);

    const openChatModal = (order) => {
        setSelectedOrder(order);
        setIsChatModalOpen(true);
    };

    const viewDetail = (order) => {
        setSelectedOrder(order);
        setIsChatModalOpen(true);
    };

    const closeChatModal = () => {
        setIsChatModalOpen(false);
        setSelectedOrder(null);
    };

    const fetchOrderDetail = async (orderId) => {
        try {
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetOrderByOrderId?OrderId=${orderId}`);
            const data = await response.json();

            if (data.statusCode === 200) {
                setSelectedOrderDetail(data.data);
                setDetailModalVisible(true);
            }
        } catch (error) {
            console.error("Error fetching order detail:", error);
            message.error('Failed to load order details');
        }
    };

    const handlePaymentRetry = async (orderId) => {
        try {
            const response = await fetch('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/VnPay/proceed-vnpay-payment', {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(orderId)
            });

            const data = await response.json();

            if (data.paymentUrl) {
                // Redirect to VNPay payment URL
                window.location.href = data.paymentUrl;
            } else {
                message.error('Failed to generate payment URL');
            }
        } catch (error) {
            console.error('Payment retry error:', error);
            message.error('Failed to process payment');
        }
    };

    const handleDelete = async (orderId) => {
        try {
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Refund/CancelOrder?OrderId=${orderId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.statusCode === 200) {
                message.success('Order canceled successfully');
                setIsConfirmModalVisible(false); // Đóng modal sau khi hủy thành công
                fetchOrders(); // Reload orders
            } else {
                message.error(data.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Cancel order error:', error);
            message.error('Failed to cancel order');
        }
    };
    const handleFeedback = async (orderId) => {
        try {
            // Check if feedback exists for the order
            const checkResponse = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/feedback/CheckFeedBack?OrderId=${orderId}`);
            const checkData = await checkResponse.json();

            if (checkData === true) { // If feedback exists
                // Fetch the feedback details
                const feedbackResponse = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/feedback/GetFeedBackByOrderId?OrderId=${orderId}`);
                const feedbackData = await feedbackResponse.json();

                if (feedbackResponse.status === 200) {
                    setFeedbackData(feedbackData); // Set feedback data
                    setIsFeedbackModalVisible(true); // Show feedback details modal
                } else {
                    message.error('Failed to load feedback');
                }
            } else if (checkData === false) { // If no feedback exists, show input dialog
                setIsFeedbackInputModalVisible(true); // Show feedback input modal
                setSelectedOrder({ orderId }); // Hoặc bạn có thể lưu trực tiếp orderId

            }
        } catch (error) {
            console.error('Error handling feedback:', error);
            message.error('Failed to process feedback');
        }
    };

    const ChatModal = () => {
        const [messages, setMessages] = useState([]);
        const [newMessage, setNewMessage] = useState('');
        const [connection, setConnection] = useState(null);
        const [connectionState, setConnectionState] = useState('disconnected');
        const [chatRoomId, setChatRoomId] = useState(null);
        const messagesEndRef = useRef(null);

        // Add state for image handling
        const [selectedImage, setSelectedImage] = useState(null);
        const [isUploading, setIsUploading] = useState(false);
        const [showImageModal, setShowImageModal] = useState(false);
        const [modalImage, setModalImage] = useState('');
        const fileInputRef = useRef(null);

        // Existing IDs
        const orderId = selectedOrder.orderId;
        const customerId = selectedOrder.customerId;
        const employeeId = selectedOrder.staffId;

        // SignalR connection setup (unchanged)
        useEffect(() => {
            let newConnection = null;

            const createConnection = () => {
                newConnection = new HubConnectionBuilder()
                    .withUrl('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/chatHub', {
                        skipNegotiation: true, // ⚡ Chỉ dùng WebSockets
                        transport: HttpTransportType.WebSockets,
                    })
                    .withAutomaticReconnect()
                    .build();

                // Add event handlers
                newConnection.onclose(() => {
                    console.log('SignalR connection closed.');
                    setConnectionState('disconnected');
                });

                newConnection.onreconnecting(() => {
                    console.log('SignalR reconnecting...');
                    setConnectionState('reconnecting');
                });

                newConnection.onreconnected(() => {
                    console.log('SignalR reconnected. Rejoining chat room...');
                    setConnectionState('connected');
                    if (chatRoomId) {
                        newConnection.invoke("JoinChatRoom", chatRoomId).catch(console.error);
                    }
                });

                setConnection(newConnection);
            };

            createConnection();

            return () => {
                if (newConnection) {
                    newConnection.stop().catch(console.error);
                }
            };
        }, []);


        // Start connection and listen for messages (unchanged)
        useEffect(() => {
            if (!connection) return;

            const startConnection = async () => {
                if (connectionState !== 'disconnected') {
                    console.log(`Connection is already in state: ${connectionState}`);
                    return;
                }

                try {
                    setConnectionState('connecting');
                    await connection.start();
                    console.log('SignalR Connected!');
                    setConnectionState('connected');

                    // If we already have a chatRoomId, join it
                    if (chatRoomId) {
                        await connection.invoke("JoinChatRoom", chatRoomId);
                    }
                } catch (error) {
                    console.error('SignalR Connection Error:', error);
                    setConnectionState('disconnected');
                    // Try again after a delay
                    setTimeout(startConnection, 5000);
                }
            };

            // Only setup message listener once
            connection.off('ReceiveMessage'); // Remove any existing listeners
            connection.on('ReceiveMessage', (message) => {
                console.log("Received message:", message);
                setMessages(prevMessages => [...prevMessages, message]);
            });

            // Start connection if disconnected
            if (connectionState === 'disconnected') {
                startConnection();
            }
        }, [connection, connectionState, chatRoomId]);

        // Join chat room when we have both a connected connection and a room ID
        useEffect(() => {
            const joinChatRoom = async () => {
                if (connection && connectionState === 'connected' && chatRoomId) {
                    try {
                        console.log(`Joining chat room: ${chatRoomId}`);
                        await connection.invoke("JoinChatRoom", chatRoomId);
                    } catch (error) {
                        console.error('Error joining chat room:', error);
                    }
                }
            };

            joinChatRoom();

            // Clean up when component unmounts or chatRoomId changes
            return () => {
                if (connection && connectionState === 'connected' && chatRoomId) {
                    connection.invoke("LeaveChatRoom", chatRoomId).catch(console.error);
                }
            };
        }, [connection, connectionState, chatRoomId]);


        // Fetch messages from API (unchanged)
        useEffect(() => {
            if (isChatModalOpen && orderId) {
                const fetchMessages = async () => {
                    try {
                        const response = await axios.get(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/messages/messages/${orderId}/${customerId}/${employeeId}`);
                        setMessages(response.data.data);

                        // Get chatRoomId from first message if available
                        if (response.data.data && response.data.data.length > 0) {
                            const roomId = response.data.data[0].chatRoomId;
                            setChatRoomId(roomId);


                        }
                    } catch (error) {
                        console.error('Error fetching messages:', error);
                    }
                };

                fetchMessages();
            }
        }, [isChatModalOpen, orderId, customerId, employeeId]);
        // Auto-scroll to newest message (unchanged)
        useEffect(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, [messages]);

        // New: Handle image selection
        const handleImageSelect = (e) => {
            // When a file is selected through the input, set it to state
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setSelectedImage(file);
            }
        };

        // New: Remove selected image
        const handleRemoveImage = () => {
            // Clear the selected image from state
            setSelectedImage(null);
            // Also reset the file input element
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        // New: Upload image to Cloudinary
        const uploadImage = async (file) => {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'delivery_app'); // Replace with your upload preset

            try {
                // Send file to Cloudinary API
                const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/dvkqdbaue/image/upload`,
                    formData
                );
                setIsUploading(false);
                // Return the image URL from Cloudinary
                return response.data.secure_url;
            } catch (error) {
                console.error('Error uploading image:', error);
                setIsUploading(false);
                return null;
            }
        };

        // Modified: Send message to include image handling
        const sendMessage = async () => {
            // Only send if we have a chat room and either a message or image
            if (!chatRoomId || (!newMessage.trim() && !selectedImage)) return;

            try {
                let messageContent = newMessage;
                let messageType = 'text';
                let imageUrl = null;

                // If image selected, upload it first
                if (selectedImage) {
                    setIsUploading(true);
                    imageUrl = await uploadImage(selectedImage);
                    if (!imageUrl) {
                        alert('Failed to upload image');
                        setIsUploading(false);
                        return;
                    }
                    // Store image URL in messageType field
                    messageType = imageUrl;
                }

                const messageData = {
                    chatRoomId: chatRoomId,
                    senderId: customerId,
                    receiveId: employeeId,
                    messageType: messageType, // 'text' or image URL
                    content: messageContent // Text message
                };

                // Send message via API
                await axios.post('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/messages/create-message', messageData);

                // Reset input and image selection
                setNewMessage('');
                setSelectedImage(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

            } catch (error) {
                console.error('Error sending message:', error);
            } finally {
                setIsUploading(false);
            }
        };

        // New: Show full-size image in modal
        const openImageModal = (imageUrl) => {
            setModalImage(imageUrl);
            setShowImageModal(true);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex">
                    {/* Order Details Sidebar (unchanged) */}
                    <div className="w-1/3 bg-pink-50 rounded-l-2xl p-6 border-r border-pink-200">
                        <h2 className="text-2xl font-bold text-pink-600 mb-4">Order Details</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold text-gray-700">Order ID:</p>
                                <p className="text-gray-600">{selectedOrder.orderId}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Items:</p>
                                <p className="text-gray-600">{selectedOrder.details.join(", ")}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Price:</p>
                                <p className="text-gray-600">{selectedOrder.price} VND</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Payment:</p>
                                <p className="text-gray-600">{selectedOrder.payment}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Date:</p>
                                <p className="text-gray-600">{selectedOrder.date}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Status:</p>
                                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                        </div>
                    </div>


                    {/* Chat Area - modified to handle images */}
                    <div className="w-2/3 flex flex-col">
                        <div className="bg-pink-400 text-white p-4 flex justify-between items-center rounded-tr-2xl">
                            <h2 className="text-xl font-bold">Chat Support - {selectedOrder.orderId}</h2>
                            <button
                                onClick={() => setIsChatModalOpen(false)}
                                className="text-white hover:text-pink-200"

                                // onClick={() => {
                                //     setIsChatModalOpen(false);
                                //     navigate('/wallet');
                                // }}
                                // className="text-white hover:text-pink-200"

                                // onClick={() => {
                                //     setIsChatModalOpen(false);
                                //     const currentUrl = window.location.href;
                                //     const baseUrl = window.location.origin + '/wallet';
                                //     if (currentUrl !== baseUrl) {
                                //         navigate('/wallet');
                                //     }
                                // }}
                                // className="text-white hover:text-pink-200"
                            >
                                ✕
                            </button>
                        </div>


                        {/* Modified: Messages container to handle image display */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.senderId === customerId ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`
                                        max-w-[70%] p-3 rounded-xl shadow-sm
                                        ${msg.senderId === customerId
                                            ? 'bg-pink-100 text-pink-800'
                                            : 'bg-blue-100 text-blue-800'}
                                    `}>
                                        {/* Check if message contains an image */}
                                        {msg.messageType.startsWith('http') ? (
                                            <div className="image-container">
                                                <img
                                                    src={msg.messageType}
                                                    alt="Shared"
                                                    className="w-full rounded-lg mb-2 cursor-pointer"
                                                    onClick={() => openImageModal(msg.messageType)}
                                                />
                                                {msg.content && <p>{msg.content}</p>}
                                            </div>
                                        ) : (
                                            <p>{msg.content}</p>
                                        )}
                                        <p className="text-xs text-gray-500 text-right">
                                            {new Date(msg.createAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Modified: Input area with image upload */}
                        <div className="p-4 border-t">
                            {/* Image preview if selected */}
                            {selectedImage && (
                                <div className="mb-2 relative w-32 h-32 rounded overflow-hidden">
                                    <img
                                        src={URL.createObjectURL(selectedImage)}
                                        alt="Selected"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                        onClick={handleRemoveImage}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2 items-center">
                                {/* Text input */}
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    disabled={isUploading}
                                />

                                {/* Image upload button */}
                                <label className="cursor-pointer p-3 bg-blue-100 text-blue-500 rounded-lg hover:bg-blue-200">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        ref={fileInputRef}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                    📷
                                </label>

                                {/* Send button */}
                                <button
                                    onClick={sendMessage}
                                    className="bg-pink-400 text-white px-6 py-3 rounded-lg hover:bg-pink-500 transition-colors disabled:opacity-50"
                                    disabled={isUploading || (!newMessage.trim() && !selectedImage)}
                                >
                                    {isUploading ? 'Uploading...' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image modal for full-size viewing */}
                {showImageModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden relative">
                            <button
                                className="absolute top-2 right-2 text-2xl font-bold text-gray-700 h-8 w-8 rounded-full flex items-center justify-center bg-white bg-opacity-75"
                                onClick={() => setShowImageModal(false)}
                            >
                                ✕
                            </button>
                            <img src={modalImage} alt="Full Size" className="max-w-full max-h-[90vh] object-contain" />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const OrderDetailModal = () => {
        if (!selectedOrderDetail) return null;

        const renderCustomProductDetails = () => (
            <div className="space-y-6">
                <div className="bg-pink-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-pink-600 mb-4">Custom Product Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="font-semibold">Product Name:</p>
                            <p className="text-gray-700">{selectedOrderDetail.productCustomResponse.productName}</p>
                        </div>

                        <div>
                            <p className="font-semibold">Total Price:</p>
                            <p className="text-pink-600 font-bold">{selectedOrderDetail.productCustomResponse.totalPrice.toLocaleString()} VNĐ</p>
                        </div>
                        <div>
                            <p className="font-semibold">Quantity:</p>
                            <p className="text-gray-700">{selectedOrderDetail.productCustomResponse.quantity}</p>
                        </div>
                        <div>
                            <p className="font-semibold">description:</p>
                            <p className="text-gray-700">{selectedOrderDetail.productCustomResponse.description}</p>
                        </div>
                    </div>
                </div>

                {/* Flower Basket Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-lg font-bold text-pink-600 mb-4">Flower Basket Details</h4>
                    <div className="flex gap-6">
                        <img
                            src={selectedOrderDetail.productCustomResponse.flowerBasketResponse.image}
                            alt="Flower Basket"
                            className="w-48 h-48 object-cover rounded-lg shadow-lg"
                        />
                        <div className="flex-1 space-y-2">
                            <h5 className="text-xl font-semibold">{selectedOrderDetail.productCustomResponse.flowerBasketResponse.flowerBasketName}</h5>
                            <p><span className="font-semibold">Id:</span> {selectedOrderDetail.productCustomResponse.flowerBasketResponse.flowerBasketId}</p>
                            <p><span className="font-semibold">Category:</span> {selectedOrderDetail.productCustomResponse.flowerBasketResponse.categoryName}</p>
                            <p><span className="font-semibold">Price:</span> {selectedOrderDetail.productCustomResponse.flowerBasketResponse.price.toLocaleString()} VNĐ</p>
                            <p><span className="font-semibold">Description:</span> {selectedOrderDetail.productCustomResponse.flowerBasketResponse.decription}</p>
                            <div className="flex gap-4">
                                <p><span className="font-semibold">Min Quantity:</span> {selectedOrderDetail.productCustomResponse.flowerBasketResponse.minQuantity}</p>
                                <p><span className="font-semibold">Max Quantity:</span> {selectedOrderDetail.productCustomResponse.flowerBasketResponse.maxQuantity}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Style Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-lg font-bold text-pink-600 mb-4">Style Details</h4>
                    <div className="flex gap-6">
                        <img
                            src={selectedOrderDetail.productCustomResponse.styleResponse.image}
                            alt="Style"
                            className="w-48 h-48 object-cover rounded-lg shadow-lg"
                        />
                        <div className="flex-1 space-y-2">
                            <h5 className="text-xl font-semibold">{selectedOrderDetail.productCustomResponse.styleResponse.name}</h5>
                            <p><span className="font-semibold">Id:</span> {selectedOrderDetail.productCustomResponse.styleResponse.styleId}</p>
                            <p><span className="font-semibold">Category:</span> {selectedOrderDetail.productCustomResponse.styleResponse.categoryName}</p>
                            <p><span className="font-semibold">Note:</span> {selectedOrderDetail.productCustomResponse.styleResponse.note}</p>
                            <p><span className="font-semibold">Description:</span> {selectedOrderDetail.productCustomResponse.styleResponse.description}</p>
                        </div>
                    </div>
                </div>

                {/* Accessory Section */}
                {selectedOrderDetail.productCustomResponse.accessoryResponse && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h4 className="text-lg font-bold text-pink-600 mb-4">Accessory Details</h4>
                        <div className="flex gap-6">
                            <img
                                src={selectedOrderDetail.productCustomResponse.accessoryResponse.image}
                                alt="Accessory"
                                className="w-48 h-48 object-cover rounded-lg shadow-lg"
                            />
                            <div className="flex-1 space-y-2">
                                <h5 className="text-xl font-semibold">{selectedOrderDetail.productCustomResponse.accessoryResponse.name}</h5>
                                <p><span className="font-semibold">Id:</span> {selectedOrderDetail.productCustomResponse.accessoryResponse.accessoryId} VNĐ</p>
                                <p><span className="font-semibold">Price:</span> {selectedOrderDetail.productCustomResponse.accessoryResponse.price.toLocaleString()} VNĐ</p>
                                <p><span className="font-semibold">Note:</span> {selectedOrderDetail.productCustomResponse.accessoryResponse.note}</p>
                                <p><span className="font-semibold">Description:</span> {selectedOrderDetail.productCustomResponse.accessoryResponse.description}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Flowers List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-lg font-bold text-pink-600 mb-4">Selected Flowers</h4>
                    <div className="grid grid-cols-1 gap-4">
                        {selectedOrderDetail.productCustomResponse.flowerCustomResponses.map((flower, index) => (
                            <div key={index} className="flex items-center gap-6 p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <img
                                    src={flower.flowerResponse.image}
                                    alt={flower.flowerResponse.flowerName}
                                    className="w-32 h-32 object-cover rounded-lg shadow"
                                />
                                <div className="flex-1 space-y-2">
                                    <h6 className="text-lg font-semibold">{flower.flowerResponse.flowerName}</h6>
                                    <div className="grid grid-cols-2 gap-4">
                                        <p><span className="font-semibold">Id:</span> {flower.flowerResponse.flowerId}</p>
                                        <p><span className="font-semibold">Color:</span> {flower.flowerResponse.color}</p>
                                        <p><span className="font-semibold">Category:</span> {flower.flowerResponse.categoryName}</p>
                                        <p><span className="font-semibold">Quantity:</span> {flower.quantity}</p>
                                        <p><span className="font-semibold">Price:</span> {flower.totalPrice.toLocaleString()} VNĐ</p>
                                    </div>
                                    <p><span className="font-semibold">Description:</span> {flower.flowerResponse.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
        const renderDesignCustom = () => {
            if (!selectedOrderDetail.designCustomBuCustomerResponse) return null;

            const design = selectedOrderDetail.designCustomBuCustomerResponse;

            return (
                <div className="space-y-6">
                    <div className="bg-pink-50 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-pink-600 mb-4">Design Custom Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Phần bên trái */}
                            <div className="space-y-4">
                                <div>
                                    <p className="font-semibold">Request Image:</p>
                                    <img
                                        src={design.requestImage}
                                        alt="Request"
                                        className="w-full h-48 object-cover rounded-lg" // Tăng chiều cao lên 48
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold">Request Price:</p>
                                    <p className="text-pink-600 font-bold">{design.requestPrice}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Request Description:</p>
                                    <p className="text-gray-700">{design.requestDescription}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Request Occasion:</p>
                                    <p className="text-gray-700">{design.requestOccasion}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Request Main Color:</p>
                                    <p className="text-gray-700">{design.requestMainColor}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Request Flower Type:</p>
                                    <p className="text-gray-700">{design.requestFlowerType}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Request Card:</p>
                                    <p className="text-gray-700">{design.requestCard}</p>
                                </div>
                            </div>

                            {/* Phần bên phải */}
                            <div className="space-y-4">
                                <div>
                                    <p className="font-semibold">Response Image:</p>
                                    <img
                                        src={design.responseImage}
                                        alt="Response"
                                        className="w-full h-48 object-cover rounded-lg" // Tăng chiều cao lên 48
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold">Response Price:</p>
                                    <p className="text-pink-600 font-bold">{design.responsePrice.toLocaleString()} VNĐ</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Response Description:</p>
                                    <p className="text-gray-700">{design.responseDescription}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        const renderNormalOrderDetails = () => (
            <div className="space-y-4">
                {selectedOrderDetail.orderDetails.map((detail, index) => (
                    <div key={index} className="flex items-center gap-4 border-b pb-4">
                        <img
                            src={detail.productImage}
                            alt={detail.productName}
                            className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div>
                            <p className="font-semibold text-lg">{detail.productName}</p>
                            <p>Price: {detail.price.toLocaleString()} VNĐ</p>
                            <p>Quantity: {detail.quantity}</p>
                            <p>Discount: {detail.discount}%</p>
                            <p>Total: {detail.productTotalPrice.toLocaleString()} VNĐ</p>
                        </div>
                    </div>
                ))}
            </div>
        );

        return (
            <Modal
                title={
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-pink-600">Order Details</h2>
                            <p className="text-gray-500 text-sm">Order ID: {selectedOrderDetail.orderId}</p>
                        </div>
                        <Tag color={selectedOrderDetail.status === "đặt hàng thành công" ? "green" :
                            selectedOrderDetail.status === "đang xử lý" ? "blue" : "red"}>
                            {selectedOrderDetail.status}
                        </Tag>
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                width={1000}
                footer={null}
                className="max-h-[90vh] overflow-auto"
            >
                <div className="space-y-6">
                    {/* Order Information */}
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-gray-700">Order Information</h3>
                            <p><span className="font-semibold">Created:</span> {new Date(selectedOrderDetail.createAt).toLocaleString()}</p>
                            <p><span className="font-semibold">Updated:</span> {new Date(selectedOrderDetail.updateAt).toLocaleString()}</p>
                            <p><span className="font-semibold">Delivery Date:</span> {new Date(selectedOrderDetail.deliveryDateTime).toLocaleString()}</p>
                            <p><span className="font-semibold">Total Price:</span> <span className="text-pink-600 font-bold">{selectedOrderDetail.orderPrice.toLocaleString()} VNĐ</span></p>
                            <p><span className="font-semibold">Payment Method:</span> {selectedOrderDetail.transfer ? '100% Transfer' : '50% Deposit'}</p>
                            <p><span className="font-semibold">Delivery Method:</span> {selectedOrderDetail.delivery ? 'Shipping' : 'Pick up'}</p>

                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-gray-700">Contact Information</h3>
                            <p><span className="font-semibold">Store:</span> {selectedOrderDetail.storeName}</p>
                            <p><span className="font-semibold">Store Address:</span> {selectedOrderDetail.storeAddress}</p>
                            <p><span className="font-semibold">Florist ID:</span> {selectedOrderDetail.staffId}</p>
                            <p><span className="font-semibold">Florist FullName:</span> {selectedOrderDetail.staffFullName}</p>
                            <p><span className="font-semibold">Florist Email:</span> {selectedOrderDetail.staffEmail}</p>
                            <p><span className="font-semibold">Florist Phone:</span> {selectedOrderDetail.staffPhone}</p>
                        </div>
                    </div>

                    {/* Promotion Information */}
                    {selectedOrderDetail.promotionId && (
                        <div className="bg-purple-50 p-6 rounded-lg">
                            <h3 className="font-bold text-lg text-purple-600 mb-2">Promotion Applied</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <p><span className="font-semibold">Promotion Name:</span> {selectedOrderDetail.promotionName}</p>
                                <p><span className="font-semibold">Discount:</span> {selectedOrderDetail.promotionDiscount}%</p>
                            </div>
                        </div>
                    )}
                    {/* Payment Section */}
                    {selectedOrderDetail.note && (
                        <div className="bg-red-50 p-6 rounded-lg shadow-md">
                            <h3 className="font-bold text-lg text-red-700 mb-4">Delivery Notes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Delivery Address:</span>
                                    <span>{selectedOrderDetail.deliveryAddress ?? "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Delivery District:</span>
                                    <span>{selectedOrderDetail.deliveryDistrict ?? "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Delivery City:</span>
                                    <span>{selectedOrderDetail.deliveryCity ?? "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Delivery Id:</span>
                                    <span>{selectedOrderDetail.deliveryId ?? "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Shipper Id:</span>
                                    <span>{selectedOrderDetail.shipperId ?? "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Shipper Email:</span>
                                    <span>{selectedOrderDetail.shipperEmail ?? "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Delivery Phone:</span>
                                    <span>{selectedOrderDetail.shipperPhone ?? "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">NumberMoto:</span>
                                    <span>{selectedOrderDetail.NumberMoto ?? "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">ColorMoto:</span>
                                    <span>{selectedOrderDetail.ColorMoto ?? "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">MotoType:</span>
                                    <span>{selectedOrderDetail.MotoType ?? "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Note Section */}
                    {selectedOrderDetail.note && (
                        <div className="bg-yellow-50 p-6 rounded-lg">
                            <h3 className="font-bold text-lg text-yellow-700 mb-2">Order Notes</h3>
                            <p className="whitespace-pre-line">{selectedOrderDetail.note}</p>
                        </div>
                    )}


                    {/* Payment Section */}
                    {selectedOrderDetail.note && (
                        <div className="bg-orange-50 p-6 rounded-lg">
                            <h3 className="font-bold text-lg text-orange-700 mb-2">Payment Notes</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <p><span className="font-semibold">Payment ID:</span> {selectedOrderDetail.paymentId}</p>
                                <p><span className="font-semibold">Payment Method:</span> {selectedOrderDetail.paymentMethod}</p>
                                <p><span className="font-semibold">Payment Price:</span> {selectedOrderDetail.paymentPrice}</p>
                                <p><span className="font-semibold">Payment Status:</span> {selectedOrderDetail.paymentStatus}</p>
                                <p><span className="font-semibold">Create At:</span> {selectedOrderDetail.paymentCreateAt}</p>

                            </div>
                        </div>
                    )}

                    <Divider />

                    {/* Products Section */}
                    {selectedOrderDetail.designCustomBuCustomerResponse ?
                        renderDesignCustom() :
                        selectedOrderDetail.productCustomId ?
                            renderCustomProductDetails() :
                            renderNormalOrderDetails() 
                    }
                </div>
            </Modal>
        );
    };

    const FeedbackInputModal = ({ isVisible, onClose, orderId }) => {
        console.log("OrderId nhận được:", orderId); // Kiểm tra orderId

        const [feedbackText, setFeedbackText] = useState('');
        const [videoFile, setVideoFile] = useState(null);
        const [requestRefund, setRequestRefund] = useState(false);
        const [rating, setRating] = useState(0);
        const [canRequestRefund, setCanRequestRefund] = useState(false); // Trạng thái cho phép request refund

        useEffect(() => {
            const checkWallet = async () => {
                const token = sessionStorage.getItem('accessToken');
                if (!token) return;

                const decodedToken = jwtDecode(token);
                const customerId = decodedToken.Id;

                try {
                    const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Wallet/CheckWallet?CustomerId=${customerId}`);
                    const data = await response.json();

                    if (data.statusCode === 200 && data.data) {
                        setCanRequestRefund(true); // Cho phép request refund nếu API trả về true
                    } else {
                        setCanRequestRefund(false); // Không cho phép nếu API trả về false
                    }
                } catch (error) {
                    console.error('Error checking wallet:', error);
                }
            };

            checkWallet();
        }, []);

        const renderStars = () => {
            return Array.from({ length: 5 }, (_, index) => (
                <span
                    key={index}
                    className={`cursor-pointer ${index < rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    onClick={() => setRating(index + 1)} // Cập nhật rating khi nhấp vào sao
                >
                    ★
                </span>
            ));
        };

        const handleCreateFeedback = async () => {
            const formData = new FormData();
            formData.append('FeedbackByCustomer', feedbackText);
            if (videoFile) {
                formData.append('FeedBackVideoByCustomer', videoFile);
            }
            formData.append('RequestRefundByCustomer', requestRefund);
            formData.append('Rating', rating);
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                message.error('Please login to view orders');
                navigate('/login');
                return;
            }

            const decodedToken = jwtDecode(token);
            const customerId = decodedToken.Id;
            try {
                const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/feedback/create-feedback?customerId=${customerId}&orderId=${orderId}`, {
                    method: 'POST',
                    headers: {
                        'accept': 'text/plain',
                    },
                    body: formData,
                });

                const data = await response.json();
                if (data.statusCode === 200) {
                    message.success('Feedback created successfully');
                    onClose(); // Close the input modal
                } else {
                    message.error(data.message || 'Failed to create feedback');
                }
            } catch (error) {
                console.error('Error creating feedback:', error);
                message.error('Failed to create feedback');
            }
        };

        return (
            <Modal
                title="Submit Feedback"
                open={isVisible}
                onCancel={onClose}
                footer={null}
                width={600}
                className="rounded-lg border border-pink-300 shadow-lg"
            >
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h4 className="font-semibold text-lg text-pink-600">Your Feedback</h4>
                    <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Enter your feedback here..."
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        className="mt-2 border rounded-lg p-2"
                    />
                    <div className="mt-2 flex items-center">
                        <label className="font-semibold mr-2">Request Refund:</label>
                        <input
                            type="checkbox"
                            checked={requestRefund}
                            onChange={() => {
                                if (canRequestRefund) {
                                    setRequestRefund(!requestRefund);
                                } else {
                                    message.error('You cannot request a refund at this time.');
                                }
                            }}
                            onChange={() => setRequestRefund(!requestRefund)} />
                    </div>
                    <div>* bạn phải kích hoạt ví mới được sử dung refund</div>
                    {/* Rating Section */}
                    <div className="mb-6 mt-4">
                        <h4 className="font-semibold">Rating:</h4>
                        <div className="flex space-x-1">
                            {renderStars()}
                        </div>
                    </div>
                    <button
                        onClick={handleCreateFeedback}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Submit Feedback
                    </button>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    Ghi chú: nếu sản phẩm có vấn đề gì hay quay video lai và gửi cho chúng tôi
                    <div>- Với những đon hàng hư hại trên 30% chúng tôi sẽ hoàn trả lại 70% số tiền của hoa </div>

                </div>
            </Modal>
        );
    };
    const FeedbackDetailsModal = ({ feedbackData, isVisible, onClose }) => {
        return (

            <Modal
                title="Feedback Details"
                open={isVisible}
                onCancel={onClose}
                footer={null}
                width={600}
                className="rounded-lg border border-pink-300 shadow-lg"
            >


                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h4 className="font-semibold text-lg text-pink-600">Feedback Information</h4>
                    <div className="border-b pb-4 mb-4">
                        <h5 className="font-bold text-pink-500">Customer Feedback</h5>
                        <p><strong>Feedback ID:</strong> {feedbackData.feedbackId}</p>
                        <p><strong>Feedback:</strong> {feedbackData.feedbackByCustomer}</p>
                        <div className="mt-2">
                            <strong>Video:</strong>
                            {feedbackData.feedBackVideoByCustomer && (
                                <video width="100%" controls className="rounded-lg border border-pink-200">
                                    <source src={feedbackData.feedBackVideoByCustomer} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                        <p><strong>Request Refund:</strong> {feedbackData.requestRefundByCustomer ? 'Yes' : 'No'}</p>
                        <div className="flex items-center">
                            <strong>Rating:</strong>
                            <div className="ml-2">
                                {Array.from({ length: 5 }, (_, index) => (
                                    <span key={index} className={`text-${index < feedbackData.rating ? 'yellow' : 'gray'}-500`}>
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        <p><strong>Status:</strong> {feedbackData.status}</p>
                        <p><strong>Created At:</strong> {new Date(feedbackData.createAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <h5 className="font-bold text-pink-500">Reply by Store</h5>
                        <p>{feedbackData.responseFeedBackStore || "No reply from store yet."}</p>
                    </div>
                </div>
            </Modal>
        );
    };
    const renderActionButtons = (order) => {
        return (
            <div className="flex space-x-3">
                {/* Nút Xem Chi Tiết - Gradient Xanh Dương */}
                <button
                    onClick={() => fetchOrderDetail(order.orderId)}
                    className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg shadow-lg transition-all duration-300 gap-2"
                >
                    <Eye className="w-5 h-5 text-white" />
                    <span>View</span>
                </button>

                {/* Nút Hủy Đơn - Gradient Đỏ-Cam */}
                {order.status !== "Received" && order.status !== "Delivery" && order.status !== "Request refund" && (
                    <button
                        onClick={() => showCancelConfirm(order)}
                        className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white rounded-lg shadow-lg transition-all duration-300 gap-2"
                    >
                        <XCircle className="w-5 h-5 text-white" />
                        <span>Cancel</span>
                    </button>
                )}
                {(order.status === "Received" || order.status === "Request refund") && (
                    <button
                        onClick={() => handleFeedback(order.orderId)}
                        className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white rounded-lg shadow-lg transition-all duration-300 gap-2"
                    >
                        <MessageSquareText className="w-5 h-5 text-white" />
                        <span>Feedback</span>
                    </button>
                )}
                {/* Nút Chat - Hồng Neon */}
                {(order.status != "Order Successfully") && (

                <button
                    onClick={() => {
                        setSelectedOrder(order);
                        setIsChatModalOpen(true);
                    }}
                    className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full transition-all duration-300 shadow-lg"
                >
                    <MessageCircle className="w-6 h-6 text-white" />
                </button>
                 )}

            </div>

        );
    };

    const renderFailOrderActions = (order) => {
        return (
            <div className="flex space-x-2">
                <button
                    onClick={() => fetchOrderDetail(order.orderId)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg shadow-md transition-all duration-300 gap-2"
                >
                    <EyeOutlined />
                    <span>View</span>
                </button>



                {/* Payment button for failed orders */}
                <button
                    onClick={() => handlePaymentRetry(order.orderId)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white text-sm rounded-md shadow-sm transition-colors duration-200 gap-1.5"
                >
                    <CreditCardOutlined />
                    <span>Pay</span>
                </button>

                {/* Delete button */}
                <button
                    onClick={() => handleDelete(order.orderId)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white text-sm rounded-md shadow-sm transition-colors duration-200 gap-1.5"
                >
                    <DeleteOutlined />
                    <span>Remove</span>
                </button>
            </div>
        );
    };
    const renderRefundOrderActions = (order) => {
        return (
            <div className="flex space-x-2">
                <button
                    onClick={() => fetchOrderDetail(order.orderId)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg shadow-md transition-all duration-300 gap-2"
                >
                    <EyeOutlined />
                    <span>View</span>
                </button>

                <button
                    onClick={() => handleFeedback(order.orderId)}
                    className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white rounded-lg shadow-lg transition-all duration-300 gap-2"
                >
                    <MessageSquareText className="w-5 h-5 text-white" />
                    <span>Feedback</span>
                </button>
            </div>
        );
    };
    const renderCancelOrderActions = (order) => {
        return (
            <div className="flex space-x-2">
                <button
                    onClick={() => fetchOrderDetail(order.orderId)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg shadow-md transition-all duration-300 gap-2"
                >
                    <EyeOutlined />
                    <span>View Details</span>
                </button>

            </div>
        );
    };

    // Thêm hàm mới để xử lý việc mở dialog xác nhận
    const showCancelConfirm = (order) => {
        setOrderToCancel(order);
        setIsConfirmModalVisible(true);
    };

    // Thêm hàm tính toán số tiền hoàn lại
    const calculateRefundAmount = (order) => {
        let amount = 0;

        // Kiểm tra nếu order.transfer là false và order.status không phải là "Order Successfully"
        if (order.payment === "50% deposit" && order.status !== "Order Successfully") {
            return {
                percentage: 0,
                amount: 0
            };
        }

        if (order.status === "Order Successfully") {
            amount = order.price; // Giả sử order.price là số
            return {
                percentage: 100,
                amount: amount
            };
        }

        // Tính thời gian còn lại đến delivery time
        const deliveryTime = new Date(order.date);
        const now = new Date();
        const hoursRemaining = (deliveryTime - now) / (1000 * 60 * 60);
        const cleaned = order.price.replace(/[₫\s]/g, '').replace(',', '.');
        const price = parseFloat(cleaned);

        if ( hoursRemaining > 24) {
            amount =  price * 0.7 *1000  ;
            return {
                percentage: 70,
                amount: amount
            };
        } else if (hoursRemaining <= 24) {
            amount = price * 0.5 *1000;
            return {
                percentage: 50,
                amount: amount
            };
        }  else if (hoursRemaining < 3) {
            amount = price * 0.3 *1000;
            return {
                percentage: 30,
                amount: amount
            };
        }
    };

    // Cập nhật component ConfirmCancelModal
    const ConfirmCancelModal = () => {
        const refundInfo = orderToCancel ? calculateRefundAmount(orderToCancel) : null;

        return (
            <Modal
                title={
                    <div className="text-xl font-bold text-red-600 pb-2 border-b">
                        Confirm Order Cancellation
                    </div>
                }
                open={isConfirmModalVisible}
                onCancel={() => setIsConfirmModalVisible(false)}
                footer={[
                    <button
                        key="cancel"
                        onClick={() => setIsConfirmModalVisible(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 mr-2 transition-colors"
                    >
                        No, Keep Order
                    </button>,
                    <button
                        key="submit"
                        onClick={() => handleDelete(orderToCancel?.orderId)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Yes, Cancel Order
                    </button>,
                ]}
                className="rounded-lg"
            >
                <div className="p-4">
                    <div className="text-red-500 text-center mb-4">
                        <XCircle className="w-16 h-16 mx-auto mb-2" />
                    </div>
                    <p className="text-lg text-center mb-2">Are you sure you want to cancel this order?</p>
                    <p className="text-gray-500 text-center mb-4">This action cannot be undone.</p>

                    {orderToCancel && (
                        <>
                            {/* Order Details */}
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <p><span className="font-semibold">Order ID:</span> {orderToCancel.orderId}</p>
                                <p><span className="font-semibold">Details:</span> {orderToCancel.details.join(", ")}</p>
                                <p><span className="font-semibold">Total Price:</span> {orderToCancel.price} VND</p>
                                <p><span className="font-semibold">Delivery Time:</span> {orderToCancel.date}</p>
                                <p><span className="font-semibold">Status:</span> {orderToCancel.status}</p>
                            </div>

                            {/* Refund Information */}
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-700 mb-2">Refund Information</h3>
                                <div className="space-y-2">
                                    <p className="text-blue-600">
                                        {orderToCancel.payment === "50% deposit"&& orderToCancel.status !== "Order Successfully" ? (
                                            "Order is not refund."
                                        ) : (
                                            `You will receive a ${refundInfo.percentage}% refund of your payment`
                                        )}
                                    </p>
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                                        <span className="text-gray-600">Refund Amount:</span>
                                        <span className="text-lg font-bold text-green-600">
                                            {refundInfo.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {orderToCancel.payment === "50% deposit" && orderToCancel.status !== "Order Successfully" ? (
                                            "Không thể hoàn tiền cho đơn hàng này."
                                        ) : orderToCancel.status === "Order Successfully" ? (
                                            "You will receive a full refund as your order is still in the initial stage."
                                        ) : (
                                            <>
                                                Refund percentage is based on time until delivery:
                                                <ul className="list-disc ml-5 mt-1">
                                                    <li>More than 24 hours: 70% refund</li>
                                                    <li>3-24 hours: 50% refund</li>
                                                    <li>Less than 3 hours: 30% refund</li>
                                                </ul>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Warning Message */}
                            <div className="mt-4 text-sm text-gray-500 text-center">
                                The refund will be processed according to our refund policy and may take 3-5 business days.
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        );
    };

    return (
        <div className="w-full bg-pink-50">
            <Header />

            <div className="p-14 min-h-screen">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-10">
                    <div className="bg-pink-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-pink-400 rounded-full transform translate-x-8 -translate-y-8"></div>
                        <h3 className="text-xl font-medium mb-2">Total Orders</h3>
                        <p className="text-3xl font-bold">{stats.total}</p>
                    </div>

                    <div className="bg-green-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-green-400 rounded-full transform translate-x-8 -translate-y-8"></div>
                        <h3 className="text-xl font-medium mb-2">Completed Orders</h3>
                        <p className="text-3xl font-bold">{stats.completed}</p>
                    </div>

                    <div className="bg-blue-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-400 rounded-full transform translate-x-8 -translate-y-8"></div>
                        <h3 className="text-xl font-medium mb-2">Processing Orders</h3>
                        <p className="text-3xl font-bold">{stats.processing}</p>
                    </div>

                    <div className="bg-red-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-red-400 rounded-full transform translate-x-8 -translate-y-8"></div>
                        <h3 className="text-xl font-medium mb-2">Failed Orders</h3>
                        <p className="text-3xl font-bold">{stats.fail}</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`py-3 px-6 font-medium text-lg transition-all border-b-2 mr-4 ${activeTab === 'orders'
                                ? 'border-pink-500 text-pink-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('refund')}
                            className={`py-3 px-6 font-medium text-lg transition-all border-b-2 mr-4 ${activeTab === 'refund'
                                ? 'border-pink-500 text-pink-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Refund Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('cancel')}
                            className={`py-3 px-6 font-medium text-lg transition-all border-b-2 mr-4 ${activeTab === 'cancel'
                                ? 'border-pink-500 text-pink-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Cancel Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('fail')}
                            className={`py-3 px-6 font-medium text-lg transition-all border-b-2 ${activeTab === 'fail'
                                ? 'border-pink-500 text-pink-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Failed Orders
                        </button>
                    </div>
                </div>

                {/* Active Orders Tab Content */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-3xl text-left text-pink-400 font-bold mb-2">Orders</h2>
                                <p className="text-base text-left text-gray-400">Review and track your orders here</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setSelectedStatus('All')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'All'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('Order Successfully')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'Order Successfully'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    Order Successfully
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('Arranging & Packing')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'Arranging & Packing'
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    Arranging & Packing
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('Awaiting Design Approval')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'Awaiting Design Approval'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    Awaiting Design Approval
                                </button>

                                <button
                                    onClick={() => setSelectedStatus('Flower Completed')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'Flower Completed'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    Flower Completed
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('Delivery')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'Delivery'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    Delivery
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('Received')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'Received'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    Received
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('Fail')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'Fail'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    Fail
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto mt-6">
                            <table className="min-w-full">
                                <thead className="bg-pink-50">
                                    <tr>
                                        {/* <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Order ID</th> */}
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Order Image</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Details</th>

                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Payment</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Delivery</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Create Time</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Recipient Time</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.orderId}>
                                            {/* <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.orderId}</td> */}
                                            <td className="px-6 py-4 text-left">
                                                <div className="w-20 h-20 rounded-lg overflow-hidden">
                                                    {order.productCustomResponse ? (
                                                        // Ảnh cho custom product
                                                        <img
                                                            src={order.productCustomResponse.productCustomImage}
                                                            alt="Custom Product"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/150';
                                                            }}
                                                        />
                                                    ) : order.orderDetails && order.orderDetails[0] ? (
                                                        // Ảnh cho normal product
                                                        <img
                                                            src={order.orderDetails[0].productImage}
                                                            alt="Product"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/150';
                                                            }}
                                                        />
                                                    ) : order.designCustomBuCustomerResponse && order.designCustomBuCustomerResponse.responseImage ? (
                                                        // Ảnh cho design custom
                                                        <img
                                                            src={order.designCustomBuCustomerResponse.responseImage}
                                                            alt="Design"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/150';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-left text-base">{order.details.join(", ")}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.price}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.payment}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.delivery}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.createAt}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.date}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap">
                                                <span className={`px-2 py-1 text-base rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap">
                                                {renderActionButtons(order)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Refund Orders Tab Content */}
                {activeTab === 'refund' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
                        <h2 className="text-3xl text-left text-pink-400 font-bold mb-2">Refund Orders</h2>
                        <p className="text-base text-left text-gray-400 mb-8">Review and track your refund orders here</p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-pink-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Order ID</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Details</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Payment</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Delivery</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Create Time</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Recipient Time</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {refundOrders.map((order) => (
                                        <tr key={order.orderId}>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.orderId}</td>
                                            <td className="px-6 py-4 text-left text-base">{order.details.join(", ")}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.price}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.payment}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.delivery}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.createAt}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.date}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap">
                                                <span className={`px-2 py-1 text-base rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap">
                                                {renderRefundOrderActions(order)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Cancel Orders Tab Content */}
                {activeTab === 'cancel' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
                        <h2 className="text-3xl text-left text-pink-400 font-bold mb-2">Cancel Orders</h2>
                        <p className="text-base text-left text-gray-400 mb-8">Review and track your cancel orders here</p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-pink-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Order ID</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Details</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Payment</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Delivery</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Create Time</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Recipient Time</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {cancelOrders.map((order) => (
                                        <tr key={order.orderId}>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.orderId}</td>
                                            <td className="px-6 py-4 text-left text-base">{order.details.join(", ")}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.price}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.payment}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.delivery}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.createAt}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.date}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap">
                                                <span className={`px-2 py-1 text-base rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap">
                                                {renderCancelOrderActions(order)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Fail Orders Tab Content */}
                {activeTab === 'fail' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
                        <h2 className="text-3xl text-left text-pink-400 font-bold mb-2">Failed Orders</h2>
                        <p className="text-base text-left text-gray-400 mb-8">Review and track your failed orders here</p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-pink-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Order ID</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Details</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Payment</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Delivery</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Create Time</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Recipient Time</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {failOrders.map((order) => (
                                        <tr key={order.orderId}>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.orderId}</td>
                                            <td className="px-6 py-4 text-left text-base">{order.details.join(", ")}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.price}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.payment}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.delivery}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.createAt}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-base">{order.date}</td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap">
                                                <span className={`px-2 py-1 text-base rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-left whitespace-nowrap">
                                                {renderFailOrderActions(order)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
            {isChatModalOpen && <ChatModal />}
            {detailModalVisible && <OrderDetailModal />}
            {isFeedbackInputModalVisible &&
                <FeedbackInputModal
                    isVisible={isFeedbackInputModalVisible}
                    onClose={() => setIsFeedbackInputModalVisible(false)}
                    orderId={selectedOrder?.orderId}
                />
            }
            {isFeedbackModalVisible && <FeedbackDetailsModal
                feedbackData={feedbackData}
                isVisible={isFeedbackModalVisible}
                onClose={() => setIsFeedbackModalVisible(false)}
            />}
            <ConfirmCancelModal /> {/* Thêm Modal xác nhận */}
        </div>
    );
};

export default WalletPage;