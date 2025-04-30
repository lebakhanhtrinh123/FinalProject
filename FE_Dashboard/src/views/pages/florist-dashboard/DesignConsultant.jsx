import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import { jwtDecode } from "jwt-decode";
import ChatModal from "chat/ChatModal";

import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Stack,
    Chip,
    Avatar,
    TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const getStatusColor = (status) => {
    switch (status) {
        case 'Design Successfully':
            return '#d1fae5'; // Xanh nhạt (bg-green-200)
        case 'Send Request':
            return '#fbcfe8'; // Hồng nhạt (bg-pink-200)
        case 'Send Response':
            return '#fef9c3';
        case 'Design Failure':
            return '#ff9999';
        default:
            return '#e5e7eb'; // Xám nhạt (bg-gray-200)
    }
};

const getStatusColorText = (status) => {
    switch (status) {
        case 'Design Successfully':
            return 'text-green-800'; // Xanh đậm
        case 'Send Request':
            return 'text-pink-800'; // Hồng đậm
        case 'Send Response':
            return 'text-yellow-800'; // Vàng đậm
        case 'Design Failure':
            return 'text-red-800'; // Xanh dương đậm



    }
};

const formatDateTime = (dateTimeStr) => {
    return new Date(dateTimeStr).toLocaleString();
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        padding: theme.spacing(2),
    }
}));


const OrderSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    background: '#ffffff',
    borderRadius: 12,
    marginBottom: theme.spacing(3),
    border: '1px solid #e0e0e0',
    '& .section-title': {
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: theme.spacing(2),
        marginBottom: theme.spacing(3),
    }
}));

const InfoRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& .label': {
        color: theme.palette.text.secondary,
        width: '140px',
        flexShrink: 0,
    },
    '& .value': {
        flex: 1,
        fontWeight: 500,
    }
}));

const DesignManagement = () => {
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [detailedDesign, setDetailedDesign] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [hasNewMessage, setHasNewMessage] = useState(false);

    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [connection, setConnection] = useState(null);

   

    const [responsePrice, setResponsePrice] = useState('');
    const [responseDescription, setResponseDescription] = useState('');
    const [responseImage, setResponseImage] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        // Kiểm tra query parameter khi component mount
        const queryParams = new URLSearchParams(location.search);

        const openChat = queryParams.get('openChat');

        if (openChat === 'true') {
            const orderId = queryParams.get('orderId');
            const customerId = queryParams.get('customerId');
            const employeeId = queryParams.get('employeeId');


            if (orderId && customerId && employeeId) {
                const fakeTask = {
                  orderId: orderId,
                  customerId: customerId,
                  employeeId: employeeId,
                };
                handleOpenChatDialog(fakeTask);
                navigate('/floristDashboard/task-management', { replace: true });
            }
        }
    }, [location]);

    // Thiết lập kết nối SignalR
    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/chatHub`, {
                skipNegotiation: true, // ⚡ Bắt buộc nếu chỉ dùng WebSockets
                transport: HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .build();

        const startConnection = async () => {
            try {
                await newConnection.start();
                console.log("✅ SignalR Connected!");
                setConnection(newConnection);
            } catch (error) {
                console.error("❌ SignalR Connection Error:", error);
            }
        };

        startConnection();

        newConnection.onclose(() => console.log("⚠️ SignalR connection closed."));
        newConnection.onreconnecting(() => console.log("🔄 SignalR reconnecting..."));
        newConnection.onreconnected(() => console.log("✅ SignalR reconnected."));

        return () => {
            if (newConnection.state === "Connected") {
                newConnection.stop().then(() => console.log("🔌 SignalR Disconnected."));
            }
        };
    }, []);

    // // Lắng nghe tin nhắn mới
    useEffect(() => {
        if (!connection) return;

        connection.on('ReceiveMessage', (message) => {
            console.log("Received message:", message);
            console.log("Message Sender ID:", message.senderId);
            console.log("Selected Task Customer ID:", selectedTask?.customerId);

            // Kiểm tra nếu tin nhắn mới là từ customerId
            if (message.senderId === selectedTask?.customerId) {
                console.log("New message from customer:", message);
                setHasNewMessage(true); // Cập nhật trạng thái có tin nhắn mới
            }
        });

        return () => {
            connection.off('ReceiveMessage');
        };
    }, [connection, selectedTask]);

    const handleOpenChatDialog = (design) => {
        console.log("Opening chat for task:", design);
        setSelectedTask(design);
        setIsChatModalOpen(true);
        setHasNewMessage(false);
    };

    const handleCloseChatDialog = () => {
        setSelectedTask(null);
        setIsChatModalOpen(false);
        setHasNewMessage(false);
    };
  

    const fetchDesigns = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('No token found');
                return;
            }
            const decodedToken = jwtDecode(token);
            const staffId = decodedToken.Id;

            const response = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/DesignCustom/GetDesignCustomByStaff?staff=${staffId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('API Response:', response.data);
            setDesigns(response.data.data);
            // setRefundOrders(response.data.data)
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchDesigns();
    }, []);



    const filteredOrders =
        filterStatus === 'All'
            ? designs
            : designs.filter((design) => design.status === filterStatus);

   

    const handleViewDetails = async (design) => {
        try {
            const response = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/DesignCustom/GetDesignCustomById?id=${design.designCustomId}`
            );
            setDetailedDesign(response.data.data);
            setDialogOpen(true);
            setSelectedTask(design);

        } catch (error) {
            console.error('Error fetching design details:', error);
        }
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setDetailedDesign(null);
    };

    const handleResponse = async () => {
        try {
            const formData = new FormData();
            formData.append('ResponsePrice', responsePrice);
            formData.append('ResponseImage', responseImage);
            formData.append('ResponseDescription', responseDescription);

            const response = await axios.put(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/DesignCustom/UpdateDesignCustomByStaff?DesginCustom=${detailedDesign.designCustomId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Response updated successfully:', response.data);

            // Kiểm tra mã trạng thái và đóng dialog nếu thành công
            if (response.status === 200) {
                handleCloseDialog(); // Đóng dialog
                message.success('Response sent successfully!'); // Thông báo thành công
            }
        } catch (error) {
            console.error('Error updating response:', error);
            message.error('Failed to send response'); // Thông báo lỗi
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h3">Design Management</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label="All"
                        color={filterStatus === "All" ? "primary" : "default"}
                        onClick={() => setFilterStatus("All")}
                        sx={{
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />

                    <Chip
                        label="Send Request"
                        color={filterStatus === "Send Request" ? "primary" : "default"}
                        onClick={() => setFilterStatus("Send Request")}
                        sx={{
                            bgcolor: filterStatus === "Send Request" ? undefined : '#fbcfe8',
                            color: filterStatus === "Send Request" ? undefined : '#9d174d',
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="Send Response"
                        color={filterStatus === "Send Response" ? "primary" : "default"}
                        onClick={() => setFilterStatus("Send Response")}
                        sx={{
                            bgcolor: filterStatus === "Send Response" ? undefined : '#fef9c3',
                            color: filterStatus === "Send Response" ? undefined : '#854d0e',
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="Design Successfully"
                        color={filterStatus === "Design Successfully" ? "primary" : "default"}
                        onClick={() => setFilterStatus("Design Successfully")}
                        sx={{
                            bgcolor: filterStatus === "Design Successfully" ? undefined : '#d1fae5',
                            color: filterStatus === "Design Successfully" ? undefined : '#065f46',
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="Design Failure"
                        color={filterStatus === "Design Failure" ? "primary" : "default"}
                        onClick={() => setFilterStatus("Design Failure")}
                        sx={{
                            bgcolor: filterStatus === "Design Failure" ? undefined : '#ff9999', // Đặt màu đỏ nhạt khi chưa chọn
                            color: filterStatus === "Design Failure" ? undefined : '#ffffff', // Màu chữ trắng khi chưa chọn
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />

                </Box>
            </Box>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>DesignCustom ID</TableCell>
                                <TableCell>Request Image</TableCell>
                                <TableCell>Request Description</TableCell>
                                <TableCell>Request Price</TableCell>
                                <TableCell>Request Occasion</TableCell>
                                <TableCell>Request Main Color</TableCell>
                                <TableCell>Request FlowerType</TableCell>
                                <TableCell>RequestCard</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrders.map((design) => (
                                <TableRow key={design.designCustomId}>
                                    <TableCell>{design.designCustomId}</TableCell>
                                    <TableCell>
                                        <img src={design.requestImage} alt="request" style={{ width: '100px', height: 'auto' }} />
                                    </TableCell>
                                    <TableCell>{design.requestDescription}</TableCell>
                                    <TableCell>{design.requestPrice}</TableCell>
                                    <TableCell>{design.requestOccasion}</TableCell>
                                    <TableCell>{design.requestMainColor}</TableCell>
                                    <TableCell>{design.requestFlowerType}</TableCell>
                                    <TableCell>{design.requestCard}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={design.status}
                                            sx={{
                                                bgcolor: getStatusColor(design.status),
                                                color: getStatusColorText(design.status),
                                                fontWeight: 500,
                                                '& .MuiChip-label': { px: 2 }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outlined" onClick={() => handleViewDetails(design)}>
                                            View Details
                                        </Button>
                                        <Button
                                            onClick={() => handleOpenChatDialog({
                                                orderId: design.orderId,
                                                customerId: design.customerId,
                                                employeeId: design.staffId
                                            })}
                                            style={{ position: 'relative' }}
                                        >
                                            Chat
                                            {hasNewMessage && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 0,
                                                        width: '10px',
                                                        height: '10px',
                                                        backgroundColor: 'green',
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                            )}
                                        </Button>                
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog for detailed design information */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle sx={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    background: 'linear-gradient(45deg, #FF0080 30%, #FF8C00 90%)',
                    color: 'white',
                    borderRadius: '12px 12px 0 0',
                    padding: 3,
                }}>
                    Design Details
                </DialogTitle>
                <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
                    {detailedDesign && (
                        <Grid container spacing={2}>
                            {/* Bên trái */}
                            <Grid item xs={6}>
                                <Typography variant="h6" color="primary">Design ID: {detailedDesign.designCustomId}</Typography>
                                <Typography><strong>Request Image:</strong></Typography>
                                <img src={detailedDesign.requestImage} alt="Design" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                                <Typography><strong>Description:</strong> {detailedDesign.requestDescription}</Typography>
                                <Typography><strong>Price:</strong> {detailedDesign.requestPrice}</Typography>
                                <Typography><strong>Occasion:</strong> {detailedDesign.requestOccasion}</Typography>
                                <Typography><strong>Main Color:</strong> {detailedDesign.requestMainColor}</Typography>
                                <Typography><strong>Flower Type:</strong> {detailedDesign.requestFlowerType}</Typography>
                                <Typography><strong>Card Message:</strong> {detailedDesign.requestCard}</Typography>
                                <Typography><strong>Phone:</strong> {detailedDesign.phone}</Typography>
                                <Typography><strong>Recipient Name:</strong> {detailedDesign.recipientName}</Typography>
                            </Grid>

                            {/* Bên phải */}
                            <Grid item xs={6}>
                                {detailedDesign.status === 'Send Response' || detailedDesign.status === 'Design Successfully' || detailedDesign.status === 'Design Failure' ? (
                                    <>
                                        <Typography><strong>Response Image:</strong></Typography>
                                        <img src={detailedDesign.responseImage} alt="Response" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                                        <Typography><strong>Response Price:</strong> {detailedDesign.responsePrice}</Typography>
                                        <Typography><strong>Response Description:</strong> {detailedDesign.responseDescription}</Typography>
                                    </>
                                ) : (
                                    <>
                                        <TextField
                                            label="Response Price"
                                            value={responsePrice}
                                            onChange={(e) => setResponsePrice(e.target.value)}
                                            fullWidth
                                            margin="normal"
                                            variant="outlined"
                                            sx={{ bgcolor: '#f0f0f0' }}
                                        />
                                        <TextField
                                            label="Response Description"
                                            value={responseDescription}
                                            onChange={(e) => setResponseDescription(e.target.value)}
                                            fullWidth
                                            margin="normal"
                                            variant="outlined"
                                            sx={{ bgcolor: '#f0f0f0' }}
                                        />
                                        <Button
                                            variant="contained"
                                            component="label"
                                            fullWidth
                                            sx={{ bgcolor: '#FF0080', color: 'white', '&:hover': { bgcolor: '#FF8C00' } }}
                                        >
                                            Upload Response Image
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={(e) => setResponseImage(e.target.files[0])}
                                            />
                                        </Button>
                                        {responseImage && <Typography>{responseImage.name}</Typography>}
                                        <Button variant="contained" color="primary" onClick={handleResponse}>
                                            Response
                                        </Button>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} sx={{ bgcolor: '#FF0080', color: 'white', '&:hover': { bgcolor: '#FF8C00' } }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <ChatModal
                isOpen={isChatModalOpen}
                onClose={handleCloseChatDialog}
                task={selectedTask}
            />
        </Box>
    );
};

export default DesignManagement;