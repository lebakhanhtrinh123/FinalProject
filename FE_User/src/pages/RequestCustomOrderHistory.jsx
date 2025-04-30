import React, { useState, useEffect, useRef } from 'react';
import { MessageOutlined, EyeOutlined, CreditCardOutlined, DeleteOutlined } from '@ant-design/icons';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import { message, Modal, Divider, Tag } from 'antd';
import axios from 'axios';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, XCircle, MessageSquareText, MessageCircle } from "lucide-react";

const WalletPage = () => {
    const [messages, setMessages] = useState([]);
    const [chatRoomId, setChatRoomId] = useState(null);
    const [connectionState, setConnectionState] = useState('disconnected');
    const [connection, setConnection] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const [activeTab, setActiveTab] = useState('orders');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const navigate = useNavigate();
    const [designs, setDesigns] = useState([]);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    useEffect(() => {
        fetchDesigns();
    }, []);


    const fetchDesigns = async () => {
        try {
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                message.error('Please login to view designs');
                navigate('/login');
                return;
            }

            const decodedToken = jwtDecode(token);
            const customerId = decodedToken.Id;

            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/DesignCustom/GetDesignCustomByCustomer?customer=${customerId}`);
            const data = await response.json();

            if (data.statusCode === 200) {
                setDesigns(data.data); // Lưu trữ dữ liệu thiết kế
            } else {
                message.error('Failed to load designs');
            }
        } catch (error) {
            console.error("Error fetching designs:", error);
            message.error('Failed to load designs');
        }
    };

    const fetchDesignDetail = async (designId) => {
        try {
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/DesignCustom/GetDesignCustomById?id=${designId}`);
            const data = await response.json();

            console.log("Design Detail Data:", data); // Log dữ liệu nhận được

            if (data.statusCode === 200) {
                setSelectedDesign(data.data);
                setIsDetailModalVisible(true);
            } else {
                message.error('Failed to load design details');
            }
        } catch (error) {
            console.error("Error fetching design details:", error);
            message.error('Failed to load design details');
        }
    };

    const handleViewDetail = (designId) => {
        fetchDesignDetail(designId);
    };

    const closeDetailModal = () => {
        console.log("Closing detail modal"); // Log khi đóng modal
        setIsDetailModalVisible(false);
        setSelectedDesign(null);
    };

    const getStatusColor = (status) => {
        const colors = {
            "Design Successfully": "text-green-600 bg-green-100",
            "Send Request": "text-pink-600 bg-pink-100",
            "Send Response": "text-yellow-600 bg-yellow-100",
            "Design Failure": "text-red-600 bg-red-100",
        };
        return colors[status] || "text-gray-600 bg-gray-100";
    };



    // Simplified Chat Modal Component that just renders a basic chat interface
    const ChatModal = () => {
        const [messageText, setMessageText] = useState('');
        const [messages, setMessages] = useState([]);
        const [newMessage, setNewMessage] = useState('');
        const [connection, setConnection] = useState(null);
        const [connectionState, setConnectionState] = useState('disconnected');
        const [chatRoomId, setChatRoomId] = useState(null);
        const messagesEndRef = useRef(null);
        const [selectedImage, setSelectedImage] = useState(null);
        const [isUploading, setIsUploading] = useState(false);
        const [showImageModal, setShowImageModal] = useState(false);
        const [modalImage, setModalImage] = useState('');
        const fileInputRef = useRef(null);

        const orderId = selectedDesign.orderId;
        const customerId = selectedDesign.customerId;
        const employeeId = selectedDesign.staffId;

        useEffect(() => {
            let newConnection = new HubConnectionBuilder()
                .withUrl('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/chatHub', {
                    skipNegotiation: true,
                    transport: HttpTransportType.WebSockets,
                })
                .withAutomaticReconnect()
                .build();

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

            return () => {
                if (newConnection) {
                    newConnection.stop().catch(console.error);
                }
            };
        }, []);

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

                    if (chatRoomId) {
                        await connection.invoke("JoinChatRoom", chatRoomId);
                    }
                } catch (error) {
                    console.error('SignalR Connection Error:', error);
                    setConnectionState('disconnected');
                    setTimeout(startConnection, 5000);
                }
            };

            connection.off('ReceiveMessage');
            connection.on('ReceiveMessage', (message) => {
                console.log("Received message:", message);
                setMessages(prevMessages => [...prevMessages, message]);
            });

            if (connectionState === 'disconnected') {
                startConnection();
            }
        }, [connection, connectionState, chatRoomId]);

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

            return () => {
                if (connection && connectionState === 'connected' && chatRoomId) {
                    connection.invoke("LeaveChatRoom", chatRoomId).catch(console.error);
                }
            };
        }, [connection, connectionState, chatRoomId]);

        useEffect(() => {
            if (isChatModalOpen && orderId) {
                const fetchMessages = async () => {
                    try {
                        const response = await axios.get(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/messages/messages/${orderId}/${customerId}/${employeeId}`);
                        setMessages(response.data.data);

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

        useEffect(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, [messages]);

        const handleImageSelect = (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setSelectedImage(file);
            }
        };

        const handleRemoveImage = () => {
            setSelectedImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        const uploadImage = async (file) => {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'delivery_app');

            try {
                const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/dvkqdbaue/image/upload`,
                    formData
                );
                setIsUploading(false);
                return response.data.secure_url;
            } catch (error) {
                console.error('Error uploading image:', error);
                setIsUploading(false);
                return null;
            }
        };

        const sendMessage = async () => {
            if (!chatRoomId || (!newMessage.trim() && !selectedImage)) return;

            try {
                let messageContent = newMessage;
                let messageType = 'text';
                let imageUrl = null;

                if (selectedImage) {
                    setIsUploading(true);
                    imageUrl = await uploadImage(selectedImage);
                    if (!imageUrl) {
                        alert('Failed to upload image');
                        setIsUploading(false);
                        return;
                    }
                    messageType = imageUrl;
                }

                const messageData = {
                    chatRoomId: chatRoomId,
                    senderId: customerId,
                    receiveId: employeeId,
                    messageType: messageType,
                    content: messageContent
                };

                await axios.post('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/messages/create-message', messageData);

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

        const openImageModal = (imageUrl) => {
            setModalImage(imageUrl);
            setShowImageModal(true);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex">
                    <div className="w-1/3 bg-pink-50 rounded-l-2xl p-6 border-r border-pink-200">
                        <h2 className="text-2xl font-bold text-pink-600 mb-4">Design Details</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold text-gray-700">Design ID:</p>
                                <p className="text-gray-600">{selectedDesign?.designCustomId || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Description:</p>
                                <p className="text-gray-600">{selectedDesign?.requestDescription || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Price:</p>
                                <p className="text-gray-600">{selectedDesign?.requestPrice || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Status:</p>
                                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(selectedDesign?.status || '')}`}>
                                    {selectedDesign?.status || 'N/A'}
                                </span>
                            </div>
                        </div>

                    </div>

                    <div className="w-2/3 flex flex-col">
                        <div className="bg-pink-400 text-white p-4 flex justify-between items-center rounded-tr-2xl">
                            <h2 className="text-xl font-bold">Chat Support - {selectedDesign?.orderId || 'Design'}</h2>
                            <button
                                onClick={() => setIsChatModalOpen(false)}
                                className="text-white hover:text-pink-200"
                            >
                                ✕
                            </button>
                        </div>

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

                        <div className="p-4 border-t">
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
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    disabled={isUploading}
                                />

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

    const deleteDesign = async (designId) => {
        try {
            const response = await axios.delete(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/DesignCustom/DeleteDesignCustom?id=${designId}`);
            if (response.data.statusCode === 200) {
                message.success('Design deleted successfully!');
                fetchDesigns(); // Refresh the designs list after deletion
            } else {
                message.error('Failed to delete design');
            }
        } catch (error) {
            console.error('Error deleting design:', error);
            message.error('Failed to delete design');
        }
    };



    const renderActionButtons = (design) => {
        return (
            <div className="flex space-x-3">
                {/* Nút Xem Chi Tiết - Gradient Xanh Dương */}
                <button
                    onClick={() => handleViewDetail(design.designCustomId)}
                    className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg shadow-lg transition-all duration-300 gap-2"
                >
                    <Eye className="w-5 h-5 text-white" />
                    <span>View</span>
                </button>

                {/* Nút Hủy Đơn - Gradient Đỏ-Cam */}
                {design.status !== "Design Successfully" && (
                    <button
                        onClick={() => deleteDesign(design.designCustomId)}
                        className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white rounded-lg shadow-lg transition-all duration-300 gap-2"
                    >
                        <XCircle className="w-5 h-5 text-white" />

                        <span>Cancel</span>
                    </button>
                )}
                {/* Nút Checkout - chỉ hiển thị nếu trạng thái là "Send Response" */}
                {design.status === "Send Response" && (
                    <button
                        onClick={() => navigate('/checkout-custom2', {
                            state: {
                                design: {
                                    ...design,
                                    DesignCustom: design.designCustomId,
                                    totalPrice: design.responsePrice,
                                }
                            }
                        })}
                        className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white rounded-lg shadow-lg transition-all duration-300 gap-2"
                    >
                        <CreditCardOutlined className="w-5 h-5 text-white" />
                        <span>Checkout</span>
                    </button>
                )}



                {/* Nút Chat - Hồng Neon */}
                {(design.status !== "Order Successfully") && (
                    <button
                        onClick={() => {
                            setSelectedDesign(design);
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

    const openChatModal = (design) => {
        setSelectedDesign(design);
        setIsChatModalOpen(true);
    };

    return (
        <div className="w-full bg-pink-50">
            <Header />

            <div className="p-14 min-h-screen">
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
                    </div>
                </div>

                {/* Active Orders Tab Content */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-3xl text-left text-pink-400 font-bold mb-2">Design Custom</h2>
                                <p className="text-base text-left text-gray-400">Review and track your design custom here</p>
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
                                    onClick={() => setSelectedStatus('Send Request')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'Send Request'
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    Send Request
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('Send Response')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'Send Response'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    Send Response
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('Design Successfully')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'Design Successfully'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    Design Successfully
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('Design Failure')}
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${selectedStatus === 'Design Failure'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                        }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    Design Failure
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto mt-6">
                            <table className="min-w-full">
                                <thead className="bg-pink-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Request Image</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Request Description</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Request Price</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Request Occasion</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Request MainColor</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Request FlowerType</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Request Card</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {designs
                                        .filter(design => selectedStatus === 'All' || design.status === selectedStatus)
                                        .map((design) => (
                                            <tr key={design.designCustomId}>
                                                <td className="px-6 py-4 text-left">
                                                    <div className="w-20 h-20 rounded-lg overflow-hidden">
                                                        {design.requestImage ? (
                                                            <img
                                                                src={design.requestImage}
                                                                alt="Custom Product"
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
                                                <td className="px-6 py-4 text-left whitespace-nowrap text-base">{design.requestDescription}</td>
                                                <td className="px-6 py-4 text-left whitespace-nowrap text-base">{design.requestPrice}</td>
                                                <td className="px-6 py-4 text-left whitespace-nowrap text-base">{design.requestOccasion}</td>
                                                <td className="px-6 py-4 text-left whitespace-nowrap text-base">{design.requestMainColor}</td>
                                                <td className="px-6 py-4 text-left whitespace-nowrap text-base">{design.requestFlowerType}</td>
                                                <td className="px-6 py-4 text-left whitespace-nowrap text-base">{design.requestCard}</td>
                                                <td className="px-6 py-4 text-left whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-base rounded-full ${getStatusColor(design.status)}`}>
                                                        {design.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-left whitespace-nowrap">
                                                    {renderActionButtons(design)}
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

            {/* Simple chat modal that will display when isChatModalOpen is true */}
            {isChatModalOpen && <ChatModal />}

            {/* Detail modal for viewing design details */}
            <Modal
                title="Design Details"
                visible={isDetailModalVisible}
                onCancel={closeDetailModal}
                footer={null}
                className="rounded-lg"
            >
                {selectedDesign && (
                    <div className="flex flex-col md:flex-row space-x-4 p-4 bg-gray-50 rounded-lg shadow-lg">
                        {/* Bên trái */}
                        <div className="w-full md:w-1/2 space-y-4 p-4 bg-white rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-pink-600">Request</h3>
                            <div>
                                <p className="font-semibold">Design ID:</p>
                                <p className="text-gray-600">{selectedDesign.designCustomId}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Image:</p>
                                <img src={selectedDesign.requestImage} alt="Design" className="w-full h-auto rounded-lg shadow" />
                            </div>
                            <div>
                                <p className="font-semibold">Description:</p>
                                <p className="text-gray-600">{selectedDesign.requestDescription}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Price:</p>
                                <p className="text-gray-600">{selectedDesign.requestPrice}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Occasion:</p>
                                <p className="text-gray-600">{selectedDesign.requestOccasion}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Main Color:</p>
                                <p className="text-gray-600">{selectedDesign.requestMainColor}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Flower Type:</p>
                                <p className="text-gray-600">{selectedDesign.requestFlowerType}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Card:</p>
                                <p className="text-gray-600">{selectedDesign.requestCard}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Status:</p>
                                <p className="text-gray-600">{selectedDesign.status}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Created At:</p>
                                <p className="text-gray-600">{new Date(selectedDesign.createAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Recipient Name:</p>
                                <p className="text-gray-600">{selectedDesign.recipientName}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Phone:</p>
                                <p className="text-gray-600">{selectedDesign.phone}</p>
                            </div>
                        </div>

                        {/* Bên phải */}
                        <div className="w-full md:w-1/2 space-y-4 p-4 bg-white rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-pink-600">Response</h3>
                            <div>
                                <p className="font-semibold">Staff ID:</p>
                                <p className="text-gray-600">{selectedDesign.staffId}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Staff Name:</p>
                                <p className="text-gray-600">{selectedDesign.staffName}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Response Price:</p>
                                <p className="text-gray-600">{selectedDesign.responsePrice}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Response Image:</p>
                                {selectedDesign.responseImage ? (
                                    <img src={selectedDesign.responseImage} alt="Design Response" className="w-full h-auto rounded-lg shadow" />
                                ) : (
                                    <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-lg">
                                        No Response Image
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">Response Description:</p>
                                <p className="text-gray-600">{selectedDesign.responseDescription || 'No response yet'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WalletPage;