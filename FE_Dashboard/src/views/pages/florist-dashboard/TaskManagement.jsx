import React, { useState, useEffect } from "react";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import ChatModal from "chat/ChatModal";
import { useLocation, useNavigate } from 'react-router-dom';

import {
    Box,
    FormControl,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    InputLabel,
    CardMedia,
    CircularProgress,
    Grid,
    Stack,
    Chip,
    Avatar,
    TextField,
    Checkbox,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const formatDateTime = (dateTimeStr) => {
    return new Date(dateTimeStr).toLocaleString();
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

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

const TaskManagement = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredStatus, setFilteredStatus] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [detailedOrder, setDetailedOrder] = useState(null);
    const [shippers, setShippers] = useState([]);
    const [selectedShipper, setSelectedShipper] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [note, setNote] = useState('');
    const [freeShip, setFreeShip] = useState(true);
    const [fee, setFee] = useState(0);
    const [assigningDelivery, setAssigningDelivery] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [connection, setConnection] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [refundOrders, setRefundOrders] = useState([]);
    const [failDialogOpen, setFailDialogOpen] = useState(false);
    const [failReason, setFailReason] = useState('');
    const [wallet, setWallet] = useState('');
    const [isWalletAvailable, setIsWalletAvailable] = useState(true);

    const [failImage, setFailImage] = useState(null);
    const [timeDelay, setTimeDelay] = useState('');
    const [failOrderDetails, setFailOrderDetails] = useState(null);
    const [failReasonDialogOpen, setFailReasonDialogOpen] = useState(false);

    useEffect(() => {
        // Kiểm tra query parameter khi component mount
        const queryParams = new URLSearchParams(location.search);
        const openOrderId = queryParams.get('openOrderId');

        const openChat = queryParams.get('openChat');

        if (openOrderId) {
            // Tìm task có orderId tương ứng
            const taskToOpen = tasks.find(task => task.orderId === openOrderId);

            if (taskToOpen) {
                // Tự động mở Order Details
                handleOpenDialog(taskToOpen);

                // Xóa query parameter khỏi URL để tránh mở lại khi refresh
                navigate('/floristDashboard/task-management', { replace: true });
            }
        }

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
    }, [tasks, location]);

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


    // Lắng nghe tin nhắn mới
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

    const handleOpenChatDialog = (task) => {
        console.log("Opening chat for task:", task);
        setSelectedTask(task);
        setIsChatModalOpen(true);
        setHasNewMessage(false); // Reset trạng thái chấm xanh khi mở chat
    };

    const handleCloseChatDialog = () => {
        setIsChatModalOpen(false);
        setSelectedTask(null);
        setHasNewMessage(false); // Reset trạng thái chấm xanh khi đóng chat
    };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error('No token found');
                    return;
                }
                const decodedToken = jwtDecode(token);
                const staffId = decodedToken.Id;

                const response = await axios.get(
                    `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetOrderByStaffId?StaffId=${staffId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setTasks(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('accessToken');
            const encodedStatus = encodeURIComponent(newStatus);
            await axios.put(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/UpdateStatusOrderByStaffId?orderId=${orderId}&Status=${encodedStatus}`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Refresh the tasks list
            const updatedTasks = tasks.map(task =>
                task.orderId === orderId ? { ...task, status: newStatus } : task
            );
            setTasks(updatedTasks);

            // If the dialog is open and showing this order, update its status
            if (detailedOrder && detailedOrder.orderId === orderId) {
                setDetailedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const fetchShippers = async (orderId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetDeliveryForOrderId?OrderId=${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setShippers(response.data.data);
        } catch (error) {
            console.error('Error fetching shippers:', error);
        }
    };

    const handleAssignShipper = async () => {
        if (!selectedShipper || !detailedOrder) return;

        setAssigningDelivery(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Delivery/CreateDelivery?OrderId=${detailedOrder.orderId}`,
                {
                    freeShip,
                    fee,
                    pickupLocation,
                    shipperId: selectedShipper,
                    note,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Refresh order details
            const updatedOrderResponse = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetOrderByOrderId?OrderId=${detailedOrder.orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setDetailedOrder(updatedOrderResponse.data.data);
            setSelectedShipper('');
            setPickupLocation('');
            setNote('');
            setFreeShip(true);
            setFee(0);
        } catch (error) {
            console.error('Error assigning delivery:', error);
        } finally {
            setAssigningDelivery(false);
        }
    };

    const handleOpenDialog = async (task) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetOrderByOrderId?OrderId=${task.orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setDetailedOrder(response.data.data);
            setSelectedTask(task);
            setOpenDialog(true);

            // Fetch shippers if delivery is true
            if (task.delivery) {
                fetchShippers(task.orderId);
                // Fetch delivery details
                const deliveryResponse = await axios.get(
                    `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Delivery/GetDeliveryByOrderId?OrderId=${task.orderId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                // Set delivery details to detailedOrder
                setDetailedOrder(prev => ({
                    ...prev,
                    deliveryDetails: deliveryResponse.data.data // Thêm thông tin giao hàng vào detailedOrder
                }));
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTask(null);
        setDetailedOrder(null);
    };





    const filteredTasks = filteredStatus
        ? tasks.filter((task) => task.status === filteredStatus)
        : tasks;

    const renderCustomOrderDetails = (order) => {
        const customProduct = order.productCustomResponse;
        return (
            <Box sx={{ mt: 2 }}>
                {/* Custom Product Information */}
                <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)', bgcolor: '#0000' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ borderBottom: '2px solid #FFE7EF', pb: 1 }}>
                            Custom Product Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Product Name</Typography>
                                        <Typography variant="h6">{customProduct.productName}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Total Price</Typography>
                                        <Typography variant="h6" color="primary">
                                            {formatPrice(customProduct.totalPrice)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Quantity</Typography>
                                        <Typography>{customProduct.quantity}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                                        <Typography>{customProduct.description || 'No description'}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Flower Basket Section */}
                <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)' }}>
                    <Grid container>
                        <Grid item xs={12} md={4}>
                            <CardMedia
                                component="img"
                                image={customProduct.flowerBasketResponse.image}
                                alt={customProduct.flowerBasketResponse.flowerBasketName}
                                sx={{ height: 250, objectFit: 'cover' }}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Flower Basket Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" color="textSecondary">ID</Typography>
                                            <Typography>{customProduct.flowerBasketResponse.flowerBasketId}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                                            <Typography>{customProduct.flowerBasketResponse.flowerBasketName}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                                            <Typography>{customProduct.flowerBasketResponse.categoryName}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Price</Typography>
                                            <Typography color="primary">{formatPrice(customProduct.flowerBasketResponse.price)}</Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" color="textSecondary">Quantity Range</Typography>
                                            <Typography>{customProduct.flowerBasketResponse.minQuantity} - {customProduct.flowerBasketResponse.maxQuantity}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                                            <Typography>{customProduct.flowerBasketResponse.decription}</Typography>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Grid>
                    </Grid>
                </Card>

                {/* Style Section */}
                <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)' }}>
                    <Grid container>
                        <Grid item xs={12} md={4}>
                            <CardMedia
                                component="img"
                                image={customProduct.styleResponse.image}
                                alt={customProduct.styleResponse.name}
                                sx={{ height: 250, objectFit: 'cover' }}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Style Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" color="textSecondary">ID</Typography>
                                            <Typography>{customProduct.styleResponse.styleId}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Style Name</Typography>
                                            <Typography>{customProduct.styleResponse.name}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                                            <Typography>{customProduct.styleResponse.categoryName}</Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" color="textSecondary">Note</Typography>
                                            <Typography>{customProduct.styleResponse.note}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                                            <Typography>{customProduct.styleResponse.description}</Typography>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Grid>
                    </Grid>
                </Card>

                {/* Accessory Section */}
                <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)' }}>
                    <Grid container>
                        <Grid item xs={12} md={4}>
                            <CardMedia
                                component="img"
                                image={customProduct.accessoryResponse.image}
                                alt={customProduct.accessoryResponse.name}
                                sx={{ height: 250, objectFit: 'cover' }}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Accessory Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" color="textSecondary">ID</Typography>
                                            <Typography>{customProduct.accessoryResponse.accessoryId}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                                            <Typography>{customProduct.accessoryResponse.name}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                                            <Typography>{customProduct.accessoryResponse.categoryName}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Price</Typography>
                                            <Typography color="primary">{formatPrice(customProduct.accessoryResponse.price)}</Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" color="textSecondary">Note</Typography>
                                            <Typography>{customProduct.accessoryResponse.note}</Typography>
                                            <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                                            <Typography>{customProduct.accessoryResponse.description}</Typography>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Grid>
                    </Grid>
                </Card>

                {/* Flowers Used Section */}
                <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                            Flowers Used
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Image</TableCell>
                                        <TableCell>Flower Name</TableCell>
                                        <TableCell>Color</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell align="right">Unit Price</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell align="right">Total Price</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {customProduct.flowerCustomResponses.map((flower) => (
                                        <TableRow key={flower.flowerCustomId} hover>
                                            <TableCell>{flower.flowerResponse.flowerId}</TableCell>
                                            <TableCell>
                                                <Avatar
                                                    src={flower.flowerResponse.image}
                                                    alt={flower.flowerResponse.flowerName}
                                                    variant="rounded"
                                                    sx={{ width: 50, height: 50 }}
                                                />
                                            </TableCell>
                                            <TableCell>{flower.flowerResponse.flowerName}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={flower.flowerResponse.color}
                                                    size="small"
                                                    sx={{ borderRadius: 1 }}
                                                />
                                            </TableCell>
                                            <TableCell>{flower.flowerResponse.categoryName}</TableCell>
                                            <TableCell align="right">{formatPrice(flower.flowerResponse.price)}</TableCell>
                                            <TableCell align="right">{flower.quantity}</TableCell>
                                            <TableCell align="right">
                                                <Typography color="primary" fontWeight="medium">
                                                    {formatPrice(flower.totalPrice)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    const renderRegularOrderDetails = (order) => {
        return (
            <Box sx={{ mt: 2 }}>
                <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ borderBottom: '2px solid #FFE7EF', pb: 1 }}>
                            Product List
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product ID</TableCell>
                                        <TableCell>Image</TableCell>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                        <TableCell align="right">Discount</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.orderDetails.map((detail) => (
                                        <TableRow key={detail.orderDetailId} hover>
                                            <TableCell>{detail.productId}</TableCell>
                                            <TableCell>
                                                <Avatar
                                                    src={detail.productImage}
                                                    alt={detail.productName}
                                                    variant="rounded"
                                                    sx={{ width: 50, height: 50 }}
                                                />
                                            </TableCell>
                                            <TableCell>{detail.productName}</TableCell>
                                            <TableCell align="right">{detail.quantity}</TableCell>
                                            <TableCell align="right">{formatPrice(detail.price)}</TableCell>
                                            <TableCell align="right">{detail.discount}%</TableCell>
                                            <TableCell align="right">
                                                <Typography color="primary" fontWeight="medium">
                                                    {formatPrice(detail.productTotalPrice)}
                                                </Typography>
                                            </TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>
        );
    };
    const rederDesignCustomOrderDetail = (order) => {
        const designCustom = order.designCustomBuCustomerResponse; // Lấy thông tin từ response
        return (
            <Box sx={{ mt: 2 }}>
                <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ borderBottom: '2px solid #FFE7EF', pb: 1 }}>
                            Design Custom Order Details
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Design Custom ID</Typography>
                                        <Typography variant="h6">{designCustom.designCustomId}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Request Image</Typography>
                                        <img src={designCustom.requestImage} alt="Request" style={{ width: '100%', height: 'auto' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Request Description</Typography>
                                        <Typography variant="h6">{designCustom.requestDescription}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Request Price</Typography>
                                        <Typography variant="h6">{designCustom.requestPrice}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Request Occasion</Typography>
                                        <Typography variant="h6">{designCustom.requestOccasion}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Request Main Color</Typography>
                                        <Typography variant="h6">{designCustom.requestMainColor}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Request Flower Type</Typography>
                                        <Typography variant="h6">{designCustom.requestFlowerType}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Request Card</Typography>
                                        <Typography variant="h6">{designCustom.requestCard}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                   
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Response Image</Typography>
                                        <img src={designCustom.responseImage} alt="Response" style={{ width: '100%', height: 'auto' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Response Price</Typography>
                                        <Typography variant="h6">{formatPrice(designCustom.responsePrice)}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Response Description</Typography>
                                        <Typography variant="h6">{designCustom.responseDescription}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    const renderStatusChange = (task) => {
        // Don't show status change options for Received, Cancel, and Delivery statuses
        if (task.status === "Fail" || task.status === "Received" || task.status === "Cancel" || task.status === "Delivery") {
            return null;
        }

        return (
            <Select
                size="small"
                value=""
                onChange={(e) => handleStatusChange(task.orderId, e.target.value)}
                sx={{ minWidth: 150 }}
                displayEmpty
            >
                <MenuItem value="" disabled>Change Status</MenuItem>
                <MenuItem value="Arranging & Packing">2️⃣ Arranging & Packing</MenuItem>
                <MenuItem value="Awaiting Design Approval">3️⃣ Awaiting Design Approval</MenuItem>
                <MenuItem value="Flower Completed">4️⃣ Flower Completed</MenuItem>
                {/* Chỉ hiển thị option Received nếu delivery là false (Pickup) */}
                {!task.delivery && (
                    <MenuItem value="Received">6️⃣ Received</MenuItem>
                )}

            </Select>
        );
    };

    useEffect(() => {
        const fetchRefundOrders = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error('No token found');
                    return;
                }
                const decodedToken = jwtDecode(token);
                const staffId = decodedToken.Id;

                const response = await axios.get(
                    `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetRefundOrderByStaffId?StaffId=${staffId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setRefundOrders(response.data.data);
            } catch (error) {
                console.error('Error fetching refund orders:', error);
            }
        };

        fetchRefundOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Accept refund':
                return '#d1fae5'; // Light green
            case 'Refuse refund':
                return '#fee2e2'; // Light red
            case 'Request refund':
                return '#fbcfe8'; // Light pink
          
            default:
                return '#e5e7eb'; // Light gray
        }
    };

    const getStatusColorText = (status) => {
        switch (status) {
            case 'Accept refund':
                return '#047857'; // Dark green
            case 'Refuse refund':
                return '#dc2626'; // Dark red
            case 'Request refund':
                return '#db2777'; // Dark pink
         
            default:
                return '#374151'; // Dark gray
        }
    };

    const handleViewDetails = (order) => {
        // Implement view details functionality
        console.log('View details for order:', order);
    };

    const handleFeedback = (orderId) => {
        // Implement feedback functionality
        console.log('Feedback for order:', orderId);
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            // Implement status update functionality
            console.log('Update status for order:', orderId, 'to:', status);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };
    const checkWallet = async () => {
        try {
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Wallet/CheckWallet?CustomerId=${selectedTask.customerId}`);
            const data = await response.json();

            if (data.statusCode === 200) {
                setIsWalletAvailable(data.data);
                if (!data.data) {
                    setWallet('false'); // Mặc định là false nếu không có ví
                } else {
                    setWallet(''); // Đặt lại để cho phép chọn true/false
                }
            } else {
                message.error(data.message || 'Failed to check wallet status');
            }
        } catch (error) {
            console.error("Error checking wallet:", error);
            message.error('Failed to check wallet status');
        }
    };
    const handleSubmitFail = async () => {
        try {
            const formData = new FormData();
            formData.append('ReasonFail', failReason);
            formData.append('ImageFail', failImage);
            formData.append('TimeDelay', timeDelay);
            formData.append('Wallet', wallet); // Hoặc true nếu cần

            const response = await axios.put(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/UpdateFailOrder?orderId=${selectedTask.orderId}`, // Sử dụng orderId từ selectedTask
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Order status updated to Fail:', response.data);
            
            // Kiểm tra mã trạng thái và đóng dialog nếu thành công
            if (response.status === 200) {
                fetchTasks(); // Làm mới danh sách đơn hàng
                handleCloseFailDialog(); // Đóng dialog
            }
        } catch (error) {
            console.error('Error updating order status to Fail:', error);
        }
    };

    const handleViewReasonFail = async (orderId) => {
        try {
            const response = await axios.get(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/failOrder/GetFailOrderByOrderId?orderID=${orderId}`);
            
            if (response.status === 200) {
                const failOrderData = response.data.data; // Giả sử dữ liệu nằm trong response.data.data
                setFailOrderDetails(failOrderData); // Lưu thông tin vào state
                setFailReasonDialogOpen(true); // Mở dialog
            }
        } catch (error) {
            console.error('Error fetching fail order details:', error);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h3">Florist Task Management</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label="All"
                        color={filteredStatus === "" ? "primary" : "default"}
                        onClick={() => setFilteredStatus("")}
                        sx={{
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                     <Chip
                        label="Fail"
                        color={filteredStatus === "Fail" ? "primary" : "default"}
                        onClick={() => setFilteredStatus("Fail")}
                        sx={{
                            bgcolor: filteredStatus === "Fail" ? undefined : '#ff1a1a', // Đặt màu đỏ nhạt khi chưa chọn
                            color: filteredStatus === "Fail" ? undefined : '#ffffff', // Màu chữ trắng khi chưa chọn
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="Cancel"
                        color={filteredStatus === "Cancel" ? "primary" : "default"}
                        onClick={() => setFilteredStatus("Cancel")}
                        sx={{
                            bgcolor: filteredStatus === "Cancel" ? undefined : '#ff9999', // Đặt màu đỏ nhạt khi chưa chọn
                            color: filteredStatus === "Cancel" ? undefined : '#ffffff', // Màu chữ trắng khi chưa chọn
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="2️⃣ Arranging & Packing"
                        color={filteredStatus === "Arranging & Packing" ? "primary" : "default"}
                        onClick={() => setFilteredStatus("Arranging & Packing")}
                        sx={{
                            bgcolor: filteredStatus === "Arranging & Packing" ? undefined : '#fbcfe8',
                            color: filteredStatus === "Arranging & Packing" ? undefined : '#9d174d',
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="3️⃣ Awaiting Design Approval"
                        color={filteredStatus === "Awaiting Design Approval" ? "primary" : "default"}
                        onClick={() => setFilteredStatus("Awaiting Design Approval")}
                        sx={{
                            bgcolor: filteredStatus === "Awaiting Design Approval" ? undefined : '#fef9c3',
                            color: filteredStatus === "Awaiting Design Approval" ? undefined : '#854d0e',
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="4️⃣ Flower Completed"
                        color={filteredStatus === "Flower Completed" ? "primary" : "default"}
                        onClick={() => setFilteredStatus("Flower Completed")}
                        sx={{
                            bgcolor: filteredStatus === "Flower Completed" ? undefined : '#fed7aa',
                            color: filteredStatus === "Flower Completed" ? undefined : '#9a3412',
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="5️⃣ Delivery"
                        color={filteredStatus === "Delivery" ? "primary" : "default"}
                        onClick={() => setFilteredStatus("Delivery")}
                        sx={{
                            bgcolor: filteredStatus === "Delivery" ? undefined : '#d8b4fe', // Màu nền tím nhạt
                            color: filteredStatus === "Delivery" ? undefined : '#6b21a8', // Màu chữ tím đậm
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="6️⃣ Received"
                        color={filteredStatus === "Received" ? "primary" : "default"}
                        onClick={() => setFilteredStatus("Received")}
                        sx={{
                            bgcolor: filteredStatus === "Received" ? undefined : '#bfdbfe',
                            color: filteredStatus === "Received" ? undefined : '#1e40af',
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
                                <TableCell>Order ID</TableCell>
                                <TableCell>Details</TableCell>
                                <TableCell>Order Price</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell>Delivery</TableCell>
                                <TableCell>Create Time</TableCell>
                                <TableCell>RecipientTime</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTasks.map((task) => (
                                <TableRow key={task.orderId}>
                                    <TableCell>{task.orderId}</TableCell>
                                    <TableCell>
                                        {task.productCustomResponse ?
                                            task.productCustomResponse.productName :
                                            task.orderDetails.map(detail => detail.productName).join(", ")}
                                    </TableCell>
                                    <TableCell>{formatPrice(task.orderPrice)}</TableCell>
                                    <TableCell>{task.transfer ? "100% transfer" : "50% deposit"}</TableCell>
                                    <TableCell>{task.delivery ? "Shipping" : "Pickup"}</TableCell>
                                    <TableCell>{task.createAt}</TableCell>
                                    <TableCell>{formatDateTime(task.deliveryDateTime)}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Chip
                                                label={task.status}
                                                sx={{
                                                    bgcolor: task.status === "Arranging & Packing" ? '#fbcfe8' :
                                                        task.status === "Awaiting Design Approval" ? '#fef9c3' :
                                                            task.status === "Flower Completed" ? '#fed7aa' :
                                                                task.status === "Delivery" ? '#d8b4fe' :
                                                                    task.status === "Cancel" ? '#ff9999' :
                                                                    task.status === "Fail" ? '#ff1a1a' :
                                                                        task.status === "Received" ? '#bfdbfe' : '#e5e7eb',
                                                    color: task.status === "Arranging & Packing" ? '#9d174d' :
                                                        task.status === "Awaiting Design Approval" ? '#854d0e' :
                                                            task.status === "Flower Completed" ? '#9a3412' :
                                                                task.status === "Delivery" ? '#1e40af' :

                                                                    task.status === "Received" ? '#1e40af' : '#374151',
                                                    fontWeight: 500,
                                                    '& .MuiChip-label': { px: 2 }
                                                }}
                                            />
                                            {renderStatusChange(task)}
                                            {task.status === "Fail" && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleViewReasonFail(task.orderId)}
                                                >
                                                    View Reason Fail
                                                </Button>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outlined" onClick={() => handleOpenDialog(task)}>
                                            View Details
                                        </Button>
                                        <Button
                                            onClick={() => handleOpenChatDialog({
                                                orderId: task.orderId,
                                                customerId: task.customerId,
                                                employeeId: task.staffId
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
                                        {task.status !== "Fail" && task.status !== "Received" && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => {
                                                    setFailDialogOpen(true);
                                                    setSelectedTask(task);
                                                }}
                                            >
                                                Fail
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <Box mt={4}>
                <Typography variant="h3" sx={{
                    mb: 2,
                    fontWeight: 'bold'
                }}>
                    Refund Order Management
                </Typography>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress sx={{ color: '#FF69B4' }} /> {/* Pink color for loading spinner */}
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{
                        boxShadow: '0 4px 6px -1px rgba(255, 105, 180, 0.1)',
                        borderRadius: '10px'
                    }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '' }}> {/* Light pink background */}
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Order Price</TableCell>
                                    <TableCell>Customer ID</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Create Time</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {refundOrders.map((order) => (
                                    <TableRow key={order.orderId}>
                                        <TableCell>{order.orderId}</TableCell>
                                        <TableCell>{formatPrice(order.orderPrice)}</TableCell>
                                        <TableCell>{order.customerId}</TableCell>
                                        <TableCell>{order.phone}</TableCell>
                                        <TableCell>{formatDateTime(order.createAt)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status}
                                                sx={{
                                                    bgcolor: getStatusColor(order.status),
                                                    color: getStatusColorText(order.status),
                                                    fontWeight: 500,
                                                    '& .MuiChip-label': { px: 2 }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outlined" onClick={() => handleOpenDialog(order)}>
                                                View Details
                                            </Button>

                                            {order.status === "Request refund" && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() => handleUpdateStatus(order.orderId, 'Accept refund')}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => handleUpdateStatus(order.orderId, 'Refuse refund')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
                <DialogTitle sx={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f6f8fd 0%, #ffffff 100%)',
                    borderRadius: '12px 12px 0 0',
                    padding: 3,
                }}>
                    Order Details
                </DialogTitle>
                <DialogContent sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                    {detailedOrder && (
                        <Box>
                            <Grid container spacing={3}>
                                {/* Main Order Information */}
                                <Grid item xs={12}>
                                    <OrderSection>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Box>
                                                <Typography variant="h5" gutterBottom>Order #{detailedOrder.orderId}</Typography>
                                                <Typography variant="body1" color="textSecondary">
                                                    Created at {formatDateTime(detailedOrder.createAt)}
                                                </Typography>
                                                <Typography variant="body1" color="textSecondary">
                                                    Updated at {formatDateTime(detailedOrder.updateAt)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Stack spacing={1} alignItems="flex-end">
                                                    <Chip
                                                        label={detailedOrder.status}
                                                        color={detailedOrder.status === 'Flower Completed' ? 'success' :
                                                            detailedOrder.status === 'Received' ? 'info' : 'warning'}
                                                        sx={{ mb: 1 }}
                                                    />
                                                    <Select
                                                        size="small"
                                                        value=""
                                                        onChange={(e) => handleStatusChange(detailedOrder.orderId, e.target.value)}
                                                        sx={{
                                                            minWidth: 200,
                                                            mb: 1,
                                                            '& .MuiSelect-select': { py: 1 }
                                                        }}
                                                        displayEmpty
                                                    >
                                                        <MenuItem value="" disabled>Change Status</MenuItem>
                                                        <MenuItem value="Awaiting Design Approval">4️⃣ Awaiting Design Approval</MenuItem>
                                                        <MenuItem value="Flower Completed">5️⃣ Flower Completed</MenuItem>
                                                        {/* Chỉ hiển thị option Received nếu delivery là false (Pickup) */}
                                                        {!detailedOrder.delivery && (
                                                            <MenuItem value="Received">6️⃣ Received</MenuItem>
                                                        )}
                                                    </Select>
                                                    <Typography variant="h5" color="primary">
                                                        {formatPrice(detailedOrder.orderPrice)}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Box>

                                        <Grid container spacing={4}>
                                            {/* Order Details Column */}
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="h6" className="section-title">Order Details</Typography>
                                                <Stack spacing={2}>
                                                    <InfoRow>
                                                        <Typography className="label">Payment Method</Typography>
                                                        <Typography className="value">
                                                            {detailedOrder.transfer ? "100% transfer" : "50% deposit"}
                                                        </Typography>
                                                    </InfoRow>
                                                    <InfoRow>
                                                        <Typography className="label">Delivery Date</Typography>
                                                        <Typography className="value">
                                                            {formatDateTime(detailedOrder.deliveryDateTime)}
                                                        </Typography>
                                                    </InfoRow>
                                                    <InfoRow>
                                                        <Typography className="label">Delivery Method</Typography>
                                                        <Typography className="value">
                                                            {detailedOrder.delivery ? "Shipping" : "Pickup"}
                                                        </Typography>
                                                    </InfoRow>
                                                    {detailedOrder.promotionName && (
                                                        <InfoRow>
                                                            <Typography className="label">Promotion</Typography>
                                                            <Box className="value">
                                                                <Typography>{detailedOrder.promotionName}</Typography>
                                                                <Chip
                                                                    label={`${detailedOrder.promotionDiscount}% off`}
                                                                    color="secondary"
                                                                    size="small"
                                                                    sx={{ mt: 0.5 }}
                                                                />
                                                            </Box>
                                                        </InfoRow>
                                                    )}
                                                </Stack>
                                            </Grid>

                                            {/* Contact Information Column */}
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="h6" className="section-title">Contact Information</Typography>
                                                <Stack spacing={2}>
                                                    <InfoRow>
                                                        <Typography className="label">Store</Typography>
                                                        <Box className="value">
                                                            <Typography>{detailedOrder.storeName}</Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {detailedOrder.storeAddress}
                                                            </Typography>
                                                        </Box>
                                                    </InfoRow>
                                                    <InfoRow>
                                                        <Typography className="label">Customer ID</Typography>
                                                        <Typography className="value">{detailedOrder.customerId}</Typography>
                                                    </InfoRow>
                                                    <InfoRow>
                                                        <Typography className="label">Phone</Typography>
                                                        <Typography className="value">{detailedOrder.phone}</Typography>
                                                    </InfoRow>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </OrderSection>
                                </Grid>
                                {/* Delivery Notes */}
                                <Grid item xs={12}>
                                    <OrderSection>
                                        <Typography variant="h6" className="section-title">Delivery Notes</Typography>
                                        <Stack spacing={2}>
                                            {/* {detailedOrder.delivery && (
                                                <InfoRow>
                                                    <Typography className="label">Assign Shipper</Typography>
                                                    <Box className="value" sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Select
                                                            fullWidth
                                                            size="small"
                                                            value={selectedShipper}
                                                            onChange={(e) => setSelectedShipper(e.target.value)}
                                                            displayEmpty
                                                            sx={{ maxWidth: 300 }}
                                                        >
                                                            <MenuItem value="" disabled>Select a shipper</MenuItem>
                                                            {shippers.map((shipper) => (
                                                                <MenuItem key={shipper.employeeId} value={shipper.employeeId}>
                                                                    {shipper.fullName} - {shipper.phone}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        <Button
                                                            variant="contained"
                                                            onClick={handleAssignShipper}
                                                            disabled={!selectedShipper || assigningDelivery}
                                                            sx={{ minWidth: 120 }}
                                                        >
                                                            {assigningDelivery ? (
                                                                <CircularProgress size={24} color="inherit" />
                                                            ) : (
                                                                'Assign Shipper'
                                                            )}
                                                        </Button>
                                                    </Box>
                                                </InfoRow>
                                            )} */}
                                            {detailedOrder.shipperId && (
                                                <InfoRow>
                                                    <Typography className="label">Current Shipper</Typography>
                                                    <Box className="value">
                                                        <Typography>{detailedOrder.shipperName}</Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            Phone: {detailedOrder.shipperPhone}
                                                        </Typography>
                                                    </Box>
                                                </InfoRow>
                                            )}
                                            <InfoRow>
                                                <Typography className="label">Delivery Address</Typography>
                                                <Typography className="value">{(detailedOrder.deliveryAddress ?? "N/A")}</Typography>
                                            </InfoRow>
                                            <InfoRow>
                                                <Typography className="label">Delivery District</Typography>
                                                <Typography className="value">{(detailedOrder.deliveryDistrict ?? "N/A")}</Typography>
                                            </InfoRow>
                                            <InfoRow>
                                                <Typography className="label">Delivery City</Typography>
                                                <Typography className="value">{(detailedOrder.deliveryCity ?? "N/A")}</Typography>
                                            </InfoRow>
                                        </Stack>
                                    </OrderSection>
                                </Grid>
                                {/* Order Notes */}
                                <Grid item xs={12}>
                                    <OrderSection>
                                        <Typography variant="h6" className="section-title">Order Notes</Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                            {detailedOrder.note}
                                        </Typography>
                                    </OrderSection>
                                </Grid>

                                {/* Payment Notes */}
                                <Grid item xs={12}>
                                    <OrderSection>
                                        <Typography variant="h6" className="section-title">Payment Notes</Typography>
                                        <Stack spacing={2}>
                                            <InfoRow>
                                                <Typography className="label">Payment ID</Typography>
                                                <Typography className="value">{detailedOrder.paymentId}</Typography>
                                            </InfoRow>
                                            <InfoRow>
                                                <Typography className="label">Payment Method</Typography>
                                                <Typography className="value">
                                                    <Chip
                                                        label={detailedOrder.paymentMethod}
                                                        color="info"
                                                        size="small"
                                                        sx={{ borderRadius: 1 }}
                                                    />
                                                </Typography>
                                            </InfoRow>
                                            <InfoRow>
                                                <Typography className="label">Payment Price</Typography>
                                                <Typography className="value" color="primary" fontWeight="500">
                                                    {formatPrice(detailedOrder.paymentPrice)}
                                                </Typography>
                                            </InfoRow>
                                            <InfoRow>
                                                <Typography className="label">Payment Status</Typography>
                                                <Typography className="value">
                                                    <Chip
                                                        label={detailedOrder.paymentStatus}
                                                        color={detailedOrder.paymentStatus === 'Completed' ? 'success' : 'warning'}
                                                        size="small"
                                                        sx={{ borderRadius: 1 }}
                                                    />
                                                </Typography>
                                            </InfoRow>
                                            <InfoRow>
                                                <Typography className="label">Create At</Typography>
                                                <Typography className="value">{formatDateTime(detailedOrder.paymentCreateAt)}</Typography>
                                            </InfoRow>
                                        </Stack>
                                    </OrderSection>
                                </Grid>

                                {/* Product Details */}
                                <Grid item xs={12}>
                                    <OrderSection>
                                        <Typography variant="h6" className="section-title">
                                            {detailedOrder.productCustomResponse ? 'Custom Product Details' : 'Product Details'}
                                        </Typography>
                                        {detailedOrder.productCustomResponse 
                                            ? renderCustomOrderDetails(detailedOrder) 
                                            : detailedOrder.designCustomBuCustomerResponse 
                                                ? rederDesignCustomOrderDetail(detailedOrder) 
                                                : renderRegularOrderDetails(detailedOrder)}
                                    </OrderSection>
                                </Grid>

                                {/* Assign Shipper Section */}
                                <Grid item xs={12}>
                                    <OrderSection>
                                        <Typography variant="h6" className="section-title">Assign Shipper</Typography>
                                        {detailedOrder.delivery && detailedOrder.status !== "Delivery" ? (
                                            <Stack spacing={2}>
                                                <InfoRow>
                                                    <Typography className="label">Select Shipper</Typography>
                                                    <Select
                                                        fullWidth
                                                        size="small"
                                                        value={selectedShipper}
                                                        onChange={(e) => setSelectedShipper(e.target.value)}
                                                        displayEmpty
                                                    >
                                                        <MenuItem value="" disabled>Select a shipper</MenuItem>
                                                        {shippers.map((shipper) => (
                                                            <MenuItem key={shipper.employeeId} value={shipper.employeeId}>
                                                                {shipper.fullName} - {shipper.phone}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Pickup Location</Typography>
                                                    <TextField
                                                        fullWidth
                                                        value={pickupLocation}
                                                        onChange={(e) => setPickupLocation(e.target.value)}
                                                    />
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Note</Typography>
                                                    <TextField
                                                        fullWidth
                                                        value={note}
                                                        onChange={(e) => setNote(e.target.value)}
                                                    />
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Free Shipping</Typography>
                                                    <Checkbox
                                                        checked={freeShip}
                                                        onChange={(e) => setFreeShip(e.target.checked)}
                                                    />
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Fee</Typography>
                                                    <TextField
                                                        type="number"
                                                        fullWidth
                                                        value={fee}
                                                        onChange={(e) => setFee(Number(e.target.value))}
                                                    />
                                                </InfoRow>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleAssignShipper}
                                                    disabled={!selectedShipper || assigningDelivery}
                                                >
                                                    {assigningDelivery ? <CircularProgress size={24} /> : 'Assign Shipper'}
                                                </Button>
                                            </Stack>
                                        ) : (
                                            <Typography variant="body1">This order is not eligible for assigning a shipper.</Typography>
                                        )}
                                    </OrderSection>
                                </Grid>

                                {/* Delivery Details */}
                                {detailedOrder.deliveryDetails && (
                                    <Grid item xs={12}>
                                        <OrderSection>
                                            <Typography variant="h6" className="section-title">Delivery Details</Typography>
                                            <Stack spacing={2}>
                                                <InfoRow>
                                                    <Typography className="label">Delivery ID</Typography>
                                                    <Typography className="value">{detailedOrder.deliveryDetails.deliveryId}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Shipper Name</Typography>
                                                    <Typography className="value">{detailedOrder.deliveryDetails.shipperName}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">shipper Email</Typography>
                                                    <Typography className="value">{detailedOrder.deliveryDetails.shipperEmail}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">shipper Email</Typography>
                                                    <Typography className="value">{detailedOrder.deliveryDetails.shipperPhone}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Pickup Location</Typography>
                                                    <Typography className="value">{detailedOrder.deliveryDetails.pickupLocation}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Delivery Location</Typography>
                                                    <Typography className="value">{detailedOrder.deliveryDetails.deliveryLocation}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Delivery Note</Typography>
                                                    <Typography className="value">{detailedOrder.deliveryDetails.note}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Fee</Typography>
                                                    <Typography className="value">{detailedOrder.deliveryDetails.fee}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Delivery Time</Typography>
                                                    <Typography className="value">{formatDateTime(detailedOrder.deliveryDetails.deliveryTime)}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Delivery Time Done</Typography>
                                                    <Typography className="value">{formatDateTime(detailedOrder.deliveryDetails.timeDone ?? "N/A")}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Delivery Image</Typography>
                                                    {detailedOrder.deliveryDetails.deliveryImage ? (
                                                        <img
                                                            src={detailedOrder.deliveryDetails.deliveryImage}
                                                            alt="Delivery"
                                                            style={{ width: "200px", height: "auto", borderRadius: "8px", marginTop: "8px" }}
                                                        />
                                                    ) : (
                                                        <Typography className="value">N/A</Typography>
                                                    )}
                                                </InfoRow>
                                            </Stack>
                                        </OrderSection>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button
                        onClick={handleCloseDialog}
                        variant="contained"
                        color="secondary"
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1,
                            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)',
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Render ChatModal */}
            <ChatModal
                isOpen={isChatModalOpen}
                onClose={handleCloseChatDialog}
                task={selectedTask}
            />
            <Dialog open={failDialogOpen} onClose={() => setFailDialogOpen(false)}>
                <DialogTitle>Fail Order</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Reason for Failure"
                        value={failReason}
                        onChange={(e) => setFailReason(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                    />
                    <TextField
                        label="Time Delay"
                        type="datetime-local"
                        value={timeDelay}
                        onChange={(e) => setTimeDelay(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Wallet</InputLabel>
                        <Select
                            value={wallet}
                            label="Wallet"
                            onChange={(e) => setWallet(e.target.value)}
                            disabled={!isWalletAvailable}
                        >
                            <MenuItem value="true">True</MenuItem>
                            <MenuItem value="false">False</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                    >
                        Upload Failure Image
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => setFailImage(e.target.files[0])}
                        />
                    </Button>
                    {failImage && <Typography>{failImage.name}</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFailDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmitFail} color="error">Submit</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={failReasonDialogOpen} onClose={() => setFailReasonDialogOpen(false)}>
                <DialogTitle>Fail Order Details</DialogTitle>
                <DialogContent>
                    {failOrderDetails && (
                        <Box>
                            <Typography variant="h6">Fail Order ID: {failOrderDetails.failOrderId}</Typography>
                            <Typography variant="body1">Reason: {failOrderDetails.reasonFail}</Typography>
                            <img src={failOrderDetails.imageFail} alt="Failure Image" style={{ width: '100%', height: 'auto' }} />
                            <Typography variant="body1">Time Delay: {formatDateTime(failOrderDetails.timeDelay)}</Typography>
                            <Typography variant="body1">Refund Price: {formatPrice(failOrderDetails.refundPrice)}</Typography>
                            <Typography variant="body1">Wallet: {failOrderDetails.wallet ? 'Yes' : 'No'}</Typography>
                            <Typography variant="body1">Created At: {formatDateTime(failOrderDetails.createAt)}</Typography>
                            <Typography variant="body1">Updated At: {formatDateTime(failOrderDetails.updateAt)}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFailReasonDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TaskManagement;