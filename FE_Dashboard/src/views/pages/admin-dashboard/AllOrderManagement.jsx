import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
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
} from '@mui/material';
import { styled } from '@mui/material/styles';

const getStatusColor = (status) => {
    switch (status) {
        case 'Order Successfully':
            return '#d1fae5'; // Xanh nhạt (bg-green-200)
        case 'Arranging & Packing':
            return '#fbcfe8'; // Hồng nhạt (bg-pink-200)
        case 'Awaiting Design Approval':
            return '#fef9c3'; // Vàng nhạt (bg-yellow-200)
        case 'Flower Completed':
            return '#fed7aa'; // Cam nhạt (bg-orange-200)
        case 'Received':
            return '#bfdbfe'; // Xanh dương nhạt (bg-blue-200)
        case 'Delivery':
            return '#d8b4fe';
        case 'Cancel':
            return '#ff9999';
        case 'Request refund':
            return '#fbcfe8';
        case 'Accept refund':
            return '#d1fae5';
        case 'Refuse refund':
            return 'red';
        default:
            return '#e5e7eb'; // Xám nhạt (bg-gray-200)
    }
};

const getStatusColorText = (status) => {
    switch (status) {
        case 'Order Successfully':
            return 'text-green-800'; // Xanh đậm
        case 'Arranging & Packing':
            return 'text-pink-800'; // Hồng đậm
        case 'Awaiting Design Approval':
            return 'text-yellow-800'; // Vàng đậm
        case 'Flower Completed':
            return 'text-orange-800'; // Cam đậm
        case 'Cancel':
            return 'text-red-800'; // Xanh dương đậm
        case 'Received':
            return 'text-blue-800'; // Xanh dương đậm
        case 'Processing':
            return 'text-orange-900';
        case 'Request refund':
            return 'text-pink-800';
        case 'Accept refund':
            return 'text-green-800';
        case 'Refuse refund':
            return 'text-green-800';// Cam đậm hơn
        default:
            return 'text-gray-800'; // Xám đậm
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

const OrderInfoCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #f6f8fd 0%, #ffffff 100%)',
    borderRadius: 12,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
    marginBottom: theme.spacing(3),
}));

const DetailSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    background: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)',
    marginBottom: theme.spacing(2),
}));

const ImageContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    '& img': {
        borderRadius: 8,
        transition: 'transform 0.3s ease',
        '&:hover': {
            transform: 'scale(1.05)',
        },
    },
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

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [refundOrders, setRefundOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailedOrder, setDetailedOrder] = useState(null);

    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [updatingStaff, setUpdatingStaff] = useState(false);

    const [feedbackData, setFeedbackData] = useState(null);
    const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [hasReplied, setHasReplied] = useState(false);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('No token found');
                return;
            }
            const decodedToken = jwtDecode(token);
            const storeId = decodedToken.StoreId;

            const response = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetOrder`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('API Response:', response.data);
            setOrders(response.data.data);
            // setRefundOrders(response.data.data)
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const fetchRefundOrders = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('No token found');
                return;
            }
            const decodedToken = jwtDecode(token);
            const storeId = decodedToken.StoreId;

            const response = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetRefundOrder`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('Refund Orders API Response:', response.data);
            setRefundOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching refund orders:', error);
        }
    };


    useEffect(() => {
        fetchOrders();
        fetchRefundOrders();
    }, []);

    const fetchStaffList = async (orderId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetStaffByOrderId?OrderId=${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setStaffList(response.data.data);
        } catch (error) {
            console.error('Error fetching staff list:', error);
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
    const handleAssignStaff = async () => {
        if (!selectedStaff || !detailedOrder) return;

        setUpdatingStaff(true);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/UpdateOrderByStoreId?orderId=${detailedOrder.orderId}&StaffId=${selectedStaff}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Refresh order details
            const response = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetOrderByOrderId?OrderId=${detailedOrder.orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setDetailedOrder(response.data.data);
            setSelectedStaff('');

            // Refresh orders list
            fetchOrders();
        } catch (error) {
            console.error('Error assigning staff:', error);
        } finally {
            setUpdatingStaff(false);
        }
    };

    const handleViewDetails = async (order) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetOrderByOrderId?OrderId=${order.orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setDetailedOrder(response.data.data);
            setSelectedOrder(order);

            // Fetch staff list if no staff is assigned
            if (!response.data.data.staffId) {
                fetchStaffList(order.orderId);
            }

            // Fetch delivery details if the order status is "Delivery"
            if (response.data.data.status === "Delivery" || response.data.data.status === "Received") {
                fetchDeliveryDetails(order.orderId);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };
    const handleFeedback = async (orderId) => {
        try {
            // Fetch the feedback details for the order
            const feedbackResponse = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/feedback/GetFeedBackByOrderId?OrderId=${orderId}`);
            const feedbackData = await feedbackResponse.json();

            if (feedbackResponse.status === 200) {
                // Assuming you have a state to hold feedback data
                setFeedbackData(feedbackData); // Set feedback data
                setIsFeedbackModalVisible(true); // Show feedback details modal
            } else {
                message.error('Failed to load feedback');
            }
        } catch (error) {
            console.error('Error handling feedback:', error);
            message.error('Failed to process feedback');
        }
    };
    const fetchDeliveryDetails = async (orderId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Delivery/GetDeliveryByOrderId?OrderId=${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.data) {
                setDetailedOrder(prev => ({
                    ...prev,
                    deliveryDetails: response.data.data
                }));
            } else {
                console.error('No delivery details found in response');
            }
        } catch (error) {
            console.error('Error fetching delivery details:', error);
        }
    };

    const filteredOrders =
        filterStatus === 'All'
            ? orders
            : orders.filter((order) => order.status === filterStatus);

    const getOrderItems = (order) => {
        if (order.productCustomResponse) {
            return [
                {
                    name: order.productCustomResponse.productName,
                    quantity: order.productCustomResponse.quantity,
                    price: order.orderPrice
                }
            ];
        } else if (order.orderDetails) {
            return order.orderDetails.map(detail => ({
                name: detail.productName,
                quantity: detail.quantity,
                price: detail.productTotalPrice
            }));
        }
        return [];
    };

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
                            <ImageContainer>
                                <CardMedia
                                    component="img"
                                    image={customProduct.flowerBasketResponse.image}
                                    alt={customProduct.flowerBasketResponse.flowerBasketName}
                                    sx={{ height: 250, objectFit: 'cover' }}
                                />
                            </ImageContainer>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                            <ImageContainer>
                                <CardMedia
                                    component="img"
                                    image={customProduct.styleResponse.image}
                                    alt={customProduct.styleResponse.name}
                                    sx={{ height: 250, objectFit: 'cover' }}
                                />
                            </ImageContainer>
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
                            <ImageContainer>
                                <CardMedia
                                    component="img"
                                    image={customProduct.accessoryResponse.image}
                                    alt={customProduct.accessoryResponse.name}
                                    sx={{ height: 250, objectFit: 'cover' }}
                                />
                            </ImageContainer>
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
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Product ID</TableCell>
                            <TableCell>Product Name</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Discount</TableCell>
                            <TableCell align="right">Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {order.orderDetails.map((detail) => (
                            <TableRow key={detail.orderDetailId}>
                                <TableCell>{detail.productId}</TableCell>
                                <TableCell>{detail.productName}</TableCell>
                                <TableCell>
                                    <img
                                        src={detail.productImage}
                                        alt={detail.productName}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    />
                                </TableCell>
                                <TableCell align="right">{detail.quantity}</TableCell>
                                <TableCell align="right">{formatPrice(detail.price)}</TableCell>
                                <TableCell align="right">{detail.discount}%</TableCell>
                                <TableCell align="right">{formatPrice(detail.productTotalPrice)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const handleReply = async () => {
        if (!replyText) return;

        try {
            const feedbackId = feedbackData.feedbackId;
            const response = await axios.put(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/feedback/UpdateFeedBackByStoreId?feedbackId=${feedbackId}`,
                {
                    responseFeedBackStore: replyText
                }
            );

            if (response.status === 200) {
                setHasReplied(true);
                setReplyText('');
                message.success('Reply sent successfully!');
            } else {
                message.error('Failed to send reply');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            message.error('Failed to send reply');
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.put(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/feedback/UpdateStatusFeedback?OrderId=${orderId}&status=${status}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log("re", response);

            if (response.status === 200) {
                // message.success('Status updated successfully!');
                // Optionally refresh the orders or feedback data here
                fetchRefundOrders(); // Refresh orders if needed
            } else {
                // message.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            // message.error('Failed to update status');
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h3">Order Management</Typography>
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
                        label="Cancel"
                        color={filterStatus === "Cancel" ? "primary" : "default"}
                        onClick={() => setFilterStatus("Cancel")}
                        sx={{
                            bgcolor: filterStatus === "Cancel" ? undefined : '#ff9999', // Đặt màu đỏ nhạt khi chưa chọn
                            color: filterStatus === "Cancel" ? undefined : '#ffffff', // Màu chữ trắng khi chưa chọn
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />

                    <Chip
                        label="1️⃣ Order Successfully"
                        color={filterStatus === "Order Successfully" ? "primary" : "default"}
                        onClick={() => setFilterStatus("Order Successfully")}
                        sx={{
                            bgcolor: filterStatus === "Order Successfully" ? undefined : '#d1fae5',
                            color: filterStatus === "Order Successfully" ? undefined : '#065f46',
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="2️⃣ Arranging & Packing"
                        color={filterStatus === "Arranging & Packing" ? "primary" : "default"}
                        onClick={() => setFilterStatus("Arranging & Packing")}
                        sx={{
                            bgcolor: filterStatus === "Arranging & Packing" ? undefined : '#fbcfe8',
                            color: filterStatus === "Arranging & Packing" ? undefined : '#9d174d',
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="3️⃣ Awaiting Design Approval"
                        color={filterStatus === "Awaiting Design Approval" ? "primary" : "default"}
                        onClick={() => setFilterStatus("Awaiting Design Approval")}
                        sx={{
                            bgcolor: filterStatus === "Awaiting Design Approval" ? undefined : '#fef9c3',
                            color: filterStatus === "Awaiting Design Approval" ? undefined : '#854d0e',
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="4️⃣ Flower Completed"
                        color={filterStatus === "Flower Completed" ? "primary" : "default"}
                        onClick={() => setFilterStatus("Flower Completed")}
                        sx={{
                            bgcolor: filterStatus === "Flower Completed" ? undefined : '#fed7aa',
                            color: filterStatus === "Flower Completed" ? undefined : '#9a3412',
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />
                    <Chip
                        label="5️⃣ Delivery"
                        color={filterStatus === "Delivery" ? "primary" : "default"}
                        onClick={() => setFilterStatus("Delivery")}
                        sx={{
                            bgcolor: filterStatus === "Delivery" ? undefined : '#d8b4fe',
                            color: filterStatus === "Delivery" ? undefined : '#6b21a8',
                            fontWeight: 500,
                            '&:hover': { opacity: 0.9 }
                        }}
                    />

                    <Chip
                        label="6️⃣ Received"
                        color={filterStatus === "Received" ? "primary" : "default"}
                        onClick={() => setFilterStatus("Received")}
                        sx={{
                            bgcolor: filterStatus === "Received" ? undefined : '#bfdbfe',
                            color: filterStatus === "Received" ? undefined : '#1e40af',
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
                                <TableCell>Create Time</TableCell>
                                <TableCell>Recipient Time</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.orderId}>
                                    <TableCell>{order.orderId}</TableCell>
                                    <TableCell>{order.productCustomResponse ? [order.productCustomResponse.productName] : order.orderDetails.map(detail => detail.productName)}</TableCell>
                                    <TableCell>{formatPrice(order.orderPrice)}</TableCell>
                                    <TableCell>{order.transfer ? "100% transfer" : "50% deposit"}</TableCell>
                                    <TableCell>{order.createAt}</TableCell>
                                    <TableCell>{formatDateTime(order.deliveryDateTime)}</TableCell>
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
                                        <Button variant="outlined" onClick={() => handleViewDetails(order)}>
                                            View Details
                                        </Button>
                                        {(order.status === "Received" || order.status === "Request refund" || order.status === "Accept refund" || order.status === "Refuse refund") && (
                                            <Button variant="contained" color="primary" onClick={() => handleFeedback(order.orderId)} sx={{ ml: 1 }}>
                                                Feedback
                                            </Button>
                                        )}
                                        {order.status === "Request refund" && (
                                            <Button variant="contained" color="primary" onClick={() => handleUpdateStatus(order.orderId, 'Accept refund')} sx={{ ml: 1 }}>
                                                Accept Refund
                                            </Button>
                                        )}
                                        {order.status === "Request refund" && (
                                            <Button variant="contained" color="primary" onClick={() => handleUpdateStatus(order.orderId, 'Refuse refund')} sx={{ ml: 1 }}>
                                                Reject Refund
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
                <Typography variant="h3" sx={{ mb: 2 }}>Refund Order Management</Typography>
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
                                    <TableCell>Order Price</TableCell>
                                    <TableCell>Customer ID</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Create Time</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                    <TableCell>Refund</TableCell>
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
                                            <Button variant="outlined" onClick={() => handleViewDetails(order)} sx={{ mr: 1 }}>
                                                View Details
                                            </Button>
                                            {/* {(order.status === "Received" || order.status === "Request refund" || order.status === "Accept refund" || order.status === "Refuse refund") && (
                                                <Button variant="contained" color="primary" onClick={() => handleFeedback(order.orderId)} sx={{ ml: 1 }}>
                                                    Feedback
                                                </Button>
                                            )} */}
                                            <Button variant="contained" color="primary" onClick={() => handleFeedback(order.orderId)} >
                                                Feedback
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            {order.status === "Request refund" && (
                                                <>
                                                    <Button variant="contained" color="success" onClick={() => handleUpdateStatus(order.orderId, 'Accept refund')} sx={{ mr: 1 }}>
                                                        Accept
                                                    </Button>
                                                    <Button variant="contained" color="error" onClick={() => handleUpdateStatus(order.orderId, 'Refuse refund')}>
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            <StyledDialog
                open={!!selectedOrder}
                onClose={() => {
                    setSelectedOrder(null);
                    setDetailedOrder(null);
                }}
                maxWidth="lg"
                fullWidth
            >
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
                                                <Chip
                                                    label={detailedOrder.status}
                                                    color={detailedOrder.status === 'Order Successfully' ? 'success' :
                                                        detailedOrder.status === 'Failed' ? 'error' : 'warning'}
                                                    sx={{ mb: 1 }}
                                                />
                                                <Typography variant="h5" color="primary">
                                                    {formatPrice(detailedOrder.orderPrice)}
                                                </Typography>
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

                                {/* Staff Information or Staff Selection */}
                                <Grid item xs={12}>
                                    <OrderSection>
                                        <Typography variant="h6" className="section-title">
                                            {detailedOrder.staffId ? 'Staff Information' : 'Assign Staff'}
                                        </Typography>
                                        {detailedOrder.staffId ? (
                                            <Grid container spacing={4}>
                                                <Grid item xs={12} md={6}>
                                                    <Stack spacing={2}>
                                                        <InfoRow>
                                                            <Typography className="label">Staff ID</Typography>
                                                            <Typography className="value">{detailedOrder.staffId}</Typography>
                                                        </InfoRow>
                                                        <InfoRow>
                                                            <Typography className="label">Name</Typography>
                                                            <Typography className="value">{detailedOrder.staffFullName}</Typography>
                                                        </InfoRow>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Stack spacing={2}>
                                                        <InfoRow>
                                                            <Typography className="label">Email</Typography>
                                                            <Typography className="value">{detailedOrder.staffEmail}</Typography>
                                                        </InfoRow>
                                                        <InfoRow>
                                                            <Typography className="label">Phone</Typography>
                                                            <Typography className="value">{detailedOrder.staffPhone}</Typography>
                                                        </InfoRow>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <Box>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={12} md={8}>
                                                        <Select
                                                            fullWidth
                                                            value={selectedStaff}
                                                            onChange={(e) => setSelectedStaff(e.target.value)}
                                                            displayEmpty
                                                        >
                                                            <MenuItem value="" disabled>Select a staff member</MenuItem>
                                                            {staffList.map((staff) => (
                                                                <MenuItem key={staff.employeeId} value={staff.employeeId}>
                                                                    {staff.fullName} - {staff.email}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={handleAssignStaff}
                                                            disabled={!selectedStaff || updatingStaff}
                                                            fullWidth
                                                        >
                                                            {updatingStaff ? (
                                                                <CircularProgress size={24} color="inherit" />
                                                            ) : (
                                                                'Assign Staff'
                                                            )}
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}
                                    </OrderSection>
                                </Grid>
                                {/* Delivery Notes */}

                                <Grid item xs={12}>
                                    <OrderSection>
                                        <Typography variant="h6" className="section-title">Delivery Notes</Typography>
                                        <Stack spacing={2}>
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
                                            : renderRegularOrderDetails(detailedOrder)
                                        }
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
                                                    <Typography className="label">Shipper Email</Typography>
                                                    <Typography className="value">{detailedOrder.deliveryDetails.shipperEmail}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Shipper Phone</Typography>
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
                                                    <Typography className="label">Delivery Time</Typography>
                                                    <Typography className="value">{formatDateTime(detailedOrder.deliveryDetails.deliveryTime)}</Typography>
                                                </InfoRow>
                                                <InfoRow>
                                                    <Typography className="label">Delivery Note</Typography>
                                                    <Typography className="value">{detailedOrder.deliveryDetails.note}</Typography>
                                                </InfoRow>
                                            </Stack>
                                        </OrderSection>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ padding: 2 }}>
                    <Button
                        onClick={() => setIsFeedbackModalVisible(false)}
                        color="primary"
                        sx={{
                            background: 'linear-gradient(45deg, #FF0080 30%, #FF8C00 90%)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #FF0080 40%, #FF8C00 100%)',
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </StyledDialog>

            <StyledDialog
                open={isFeedbackModalVisible}
                onClose={() => setIsFeedbackModalVisible(false)}
                maxWidth="lg"
                fullWidth
                sx={{
                    borderRadius: '12px',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(45deg,rgb(255, 33, 144) 30%,rgb(255, 96, 207) 90%)',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        padding: '16px',
                        marginBottom: '16px',
                        borderRadius: '4px 4px 0 0',
                    }}
                >
                    Feedback Information
                </DialogTitle>
                <DialogContent sx={{ padding: 3 }}>
                    {feedbackData && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                    Feedback ID: {feedbackData.feedbackId}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" color="textSecondary">
                                    Customer ID: {feedbackData.customerId}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" color="textSecondary">
                                    Order ID: {feedbackData.orderId}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1" color="textSecondary">
                                    Feedback: {feedbackData.feedbackByCustomer}
                                </Typography>
                            </Grid>

                            {/* Video Section */}
                            {feedbackData.feedBackVideoByCustomer && (
                                <Grid item xs={12}>
                                    <Typography variant="body1" color="textSecondary">Video:</Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <video width="100%" controls>
                                            <source src={feedbackData.feedBackVideoByCustomer} type="video/mp4" />
                                            <track kind="captions" srcLang="en" label="English" />
                                            Your browser does not support HTML5 video.
                                        </video>
                                    </Box>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Typography variant="body1" color="textSecondary">
                                    Request Refund: {feedbackData.requestRefundByCustomer ? 'Yes' : 'No'}
                                </Typography>
                            </Grid>

                            {/* Display Rating with Color */}
                            <Grid item xs={12}>
                                <Typography variant="body1" color="textSecondary">
                                    Rating:
                                    <Box component="span" sx={{ color: 'gold', marginLeft: 1 }}>
                                        {'★'.repeat(feedbackData.rating)}
                                    </Box>
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body1" color="textSecondary">
                                    Status: {feedbackData.status}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1" color="textSecondary">
                                    Created At: {formatDateTime(feedbackData.createAt)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1" color="textSecondary">
                                    Update At: {formatDateTime(feedbackData.updateAt)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1" color="textSecondary">
                                    Reply by Store: {feedbackData.responseFeedBackStore ?? 'No reply yet'}
                                </Typography>
                            </Grid>

                            {/* Conditional Reply Input */}
                            {feedbackData.status === "Sent By Customer" && !hasReplied && (
                                <Grid item xs={12}>
                                    <Box mt={2}>
                                        <Typography variant="body1" color="textSecondary">Reply to Customer:</Typography>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            rows="4"
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleReply}
                                            sx={{ mt: 1, background: 'linear-gradient(45deg,rgb(255, 33, 144) 30%,rgb(255, 96, 207) 90%)', color: 'white' }}
                                        >
                                            Send Reply
                                        </Button>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsFeedbackModalVisible(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </StyledDialog>
        </Box>
    );
};

export default OrderManagement;