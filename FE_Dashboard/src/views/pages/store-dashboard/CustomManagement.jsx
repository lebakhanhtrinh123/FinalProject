import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
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
    const [detailedOrder, setDetailedOrder] = useState(null);

    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [updatingStaff, setUpdatingStaff] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // useEffect(() => {
    //     const queryParams = new URLSearchParams(location.search);
    //     const openOrderId = queryParams.get('openOrderId');

    //     if (openOrderId && orders.length > 0) {
    //         const orderToOpen = orders.find(order => order.orderId === openOrderId);
    //         if (orderToOpen) {
    //             handleViewDetails(orderToOpen);
    //             queryParams.delete('openOrderId');
    //             navigate({
    //                 pathname: location.pathname,
    //                 search: queryParams.toString(),
    //             }, { replace: true });
    //         }
    //     }
    // }, [location.search, orders]);

    const fetchDesigns = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('No token found');
                return;
            }
            const decodedToken = jwtDecode(token);
            const storeId = decodedToken.StoreId;

            const response = await axios.get(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/DesignCustom/GetDesignCustomByStore?store=${storeId}`,
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

    // const fetchStaffList = async (orderId) => {
    //     try {
    //         const token = localStorage.getItem('accessToken');
    //         const response = await axios.get(
    //             `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetStaffByOrderId?OrderId=${orderId}`,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`
    //                 }
    //             }
    //         );
    //         setStaffList(response.data.data);
    //     } catch (error) {
    //         console.error('Error fetching staff list:', error);
    //     }
    // };
    // const handleAssignStaff = async () => {
    //     if (!selectedStaff || !detailedOrder) return;

    //     setUpdatingStaff(true);
    //     try {
    //         const token = localStorage.getItem('accessToken');
    //         await axios.put(
    //             `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/UpdateOrderByStoreId?orderId=${detailedOrder.orderId}&StaffId=${selectedStaff}`,
    //             {},
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`
    //                 }
    //             }
    //         );

    //         // Refresh order details
    //         const response = await axios.get(
    //             `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/GetOrderByOrderId?OrderId=${detailedOrder.orderId}`,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`
    //                 }
    //             }
    //         );
    //         setDetailedOrder(response.data.data);
    //         setSelectedStaff('');

    //         // Refresh orders list
    //         fetchOrders();
    //     } catch (error) {
    //         console.error('Error assigning staff:', error);
    //     } finally {
    //         setUpdatingStaff(false);
    //     }
    // };


    const filteredOrders =
        filterStatus === 'All'
            ? designs
            : designs.filter((design) => design.status === filterStatus);

    // const getOrderItems = (order) => {
    //     if (order.productCustomResponse) {
    //         return [
    //             {
    //                 name: order.productCustomResponse.productName,
    //                 quantity: order.productCustomResponse.quantity,
    //                 price: order.orderPrice
    //             }
    //         ];
    //     } else if (order.orderDetails) {
    //         return order.orderDetails.map(detail => ({
    //             name: detail.productName,
    //             quantity: detail.quantity,
    //             price: detail.productTotalPrice
    //         }));
    //     }
    //     return [];
    // };

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
                                        <Button variant="outlined" onClick={() => handleViewDetails(order)}>
                                            View Details
                                        </Button>
                                        {/* {(design.status === "Received" || design.status === "Request refund" || order.status === "Accept refund" || order.status === "Refuse refund") && (
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
                                        )} */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default DesignManagement;