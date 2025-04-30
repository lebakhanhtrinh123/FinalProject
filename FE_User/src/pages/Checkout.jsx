import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Input, Button, Form, Checkbox, Select, message, DatePicker, TimePicker, Modal } from 'antd';
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from 'axios';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { jwtDecode } from "jwt-decode";
const { Option } = Select;

const districts = [
    "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8",
    "Quận 9", "Quận 10", "Quận 11", "Quận 12", "Bình Thạnh", "Gò Vấp", "Tân Bình",
    "Tân Phú", "Phú Nhuận", "Bình Tân", "Thủ Đức", "Nhà Bè", "Hóc Môn", "Củ Chi",
    "Bình Chánh", "Cần Giờ"
];


const Checkout = () => {
    const [form] = Form.useForm();
    const [shippingMethod, setShippingMethod] = useState('store-pickup');
    const [paymentMethod, setPaymentMethod] = useState('vnpay');
    const [isAddressDisabled, setIsAddressDisabled] = useState(true);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingStores, setLoadingStores] = useState(true);
    const [selectedDeposit, setSelectedDeposit] = useState(null);
    const [checkwallet, setCheckWallet] = useState(null);
    const [walletPassword, setWalletPassword] = useState('');
    const [isPasswordDialogVisible, setIsPasswordDialogVisible] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const [recipientInfo, setRecipientInfo] = useState({
        name: '',
        phone: '',
        date: '',
        time: '',
    });
    const [deliveryCheckResult, setDeliveryCheckResult] = useState(null);
    const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
    const [isWalletAvailable, setIsWalletAvailable] = useState(false);
    const [wallet, setWallet] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const cartItems = location.state?.cartItems;
    const totalAmount = location.state?.totalAmount;
    const productInfo = location.state?.product;

    useEffect(() => {
        fetchPromotions();
        fetchStores();
        checkWallet();
        fetchWallet();
    }, []);

    const checkWallet = async () => {
        try {
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                message.error('Please login to continue');
                navigate('/login');
                return;
            }

            const decodedToken = jwtDecode(token);
            const customerId = decodedToken.Id;

            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Wallet/CheckWallet?CustomerId=${customerId}`);
            const data = await response.json();

            if (data.statusCode === 200) {
                setIsWalletAvailable(data.data);
                if (!data.data) {
                    setPaymentMethod('vn-pay'); // Set default payment method to VNPAY if wallet is not available
                }
            } else {
                message.error(data.message || 'Failed to check wallet status');
            }
        } catch (error) {
            console.error("Error checking wallet:", error);
            message.error('Failed to check wallet status');
        }
    };
    const fetchWallet = async () => {
        try {
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                message.error('Please login to view orders');
                navigate('/login');
                return;
            }

            // Decode token to get customer ID
            const decodedToken = jwtDecode(token);
            const customerId = decodedToken.Id;
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Wallet/GetWalletByCustomerId?CustomerId=${customerId}`);
            const data = await response.json();

            if (data.statusCode === 200) {
                setWallet(data.data);
            } else {
                console.error("Failed to fetch wallet:", data.message);
                message.error(data.message || 'Failed to load wallet');
            }
        } catch (error) {
            console.error("Error fetching wallet data:", error);
            message.error('Failed to load wallet');
        }
    };
    const handleCheck = async () => {
        try {
            setIsCheckingDelivery(true);

            // Validate form fields
            const formValues = await form.validateFields(['district', 'detailedAddress']);

            if (!selectedStore) {
                message.error('Please select a store first');
                return;
            }

            if (!formValues.district || !formValues.detailedAddress) {
                message.error('Please fill in all address information');
                return;
            }

            // Lấy thông tin sản phẩm
            let productsToCheck = [];
            if (cartItems) {
                productsToCheck = cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }));
            } else if (productInfo) {
                productsToCheck = [{
                    productId: productInfo.productId,
                    quantity: productInfo.selectedQuantity
                }];
            } else {
                message.error('No products found');
                return;
            }

            // Tạo dữ liệu gửi đi theo đúng format API yêu cầu
            const checkData = {
                checkQuantityAndWeightProducts: productsToCheck,
                city: formValues.detailedAddress,
                district: formValues.district,
                detailedAddress: "Hồ Chí Minh"
            };

            console.log('Sending data:', checkData);

            const response = await fetch(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Check/CheckDelivery?storeId=${selectedStore}`,
                {
                    method: 'POST',
                    headers: {
                        'accept': '*/*',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(checkData)
                }
            );

            const data = await response.json();
            console.log('Response:', data);

            if (data.success) {
                setDeliveryCheckResult(data);
                message.success(`Có thể đặt xe giao hàng. Phí giao: ${data.distance.toLocaleString()} VNĐ`);
            } else {
                setDeliveryCheckResult(data);
                message.error(data.message || 'Cân nặng và số km không phù hợp để đặt shipper');
            }
        } catch (error) {
            console.error('Error checking delivery:', error);
            if (error.errorFields) {
                message.error('Please fill in all required fields');
            } else {
                message.error('Failed to check delivery availability. Please try again.');
            }
        } finally {
            setIsCheckingDelivery(false);
        }
    };
    const fetchPromotions = async () => {
        try {
            const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/promotions');
            setPromotions(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching promotions:', error);
            setLoading(false);
        }
    };

    const fetchStores = async () => {
        try {
            const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Store/GetAllStore');
            if (response.data && response.data.data) {
                setStores(response.data.data);
            }
            setLoadingStores(false);
        } catch (error) {
            console.error('Error fetching stores:', error);
            setLoadingStores(false);
        }
        const fetchCheckWallet = async () => {
            try {
                const token = sessionStorage.getItem('accessToken');
                if (!token) {
                    message.error('Please login to view orders');
                    navigate('/login');
                    return;
                }

                // Decode token to get customer ID
                const decodedToken = jwtDecode(token);
                const customerId = decodedToken.Id;
                const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Wallet/CheckWallet?CustomerId=${customerId}`);
                const data = await response.json();

                console.log("Check Wallet Response:", data); // Thêm log để kiểm tra phản hồi

                if (data.statusCode === 200) {
                    setCheckWallet(data);


                }
            } catch (error) {
                console.error("Error fetching wallet data:", error);
                message.error('Failed to load wallet');
            }
        };
        fetchCheckWallet()
    };

    // Redirect if no items to checkout
    if (!cartItems && !productInfo) {
        navigate('/');
        return null;
    }

    const handleStoreChange = (value) => {
        setSelectedStore(value);
    };

    const handleShippingChange = (method) => {
        setShippingMethod(method);
        setIsAddressDisabled(method === 'store-pickup');
    };

    const handleVoucherChange = (voucherId) => {
        setSelectedVoucher(voucherId);
    };

    const calculateDiscount = () => {
        if (!selectedVoucher) return 0;
        const promotion = promotions.find(p => p.promotionId === selectedVoucher);
        if (!promotion) return 0;

        const subtotal = cartItems ? totalAmount : productInfo.totalPrice;
        return Math.round((subtotal * promotion.promotionDiscount) / 100);
    };

    const handleRecipientInfoChange = (field, value) => {
        setRecipientInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDepositChange = (value) => {
        setSelectedDeposit(value);
    };

    const handleProceedToPayment = async () => {
        try {
            // Validate form first
            await form.validateFields();

            if (!selectedStore) {
                message.error('Please select a store');
                return;
            }

            // Additional validation for shipping method and recipient info
            if (shippingMethod === 'store-pickup') {
                if (!recipientInfo.name || !recipientInfo.phone || !recipientInfo.date || !recipientInfo.time || !selectedDeposit) {
                    message.error('Please fill in all required information');
                    return;
                }
            } else if (shippingMethod === 'shop-shipping') {
                if (!deliveryCheckResult?.success) {
                    message.error('Please check delivery availability first');
                    return;
                }
            }

            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                message.error('Please login to proceed');
                navigate('/login');
                return;
            }

            const decodedToken = jwtDecode(token);
            const customerId = decodedToken.Id;

            if (!customerId) {
                message.error('User information not found. Please login again');
                navigate('/login');
                return;
            }

            // Get form values
            const formValues = await form.getFieldsValue();
            const cardMessage = formValues.cardMessage;
            const hideGiverName = formValues.hideGiverName;
            const importantNote = formValues.importantNote;

            // Format note
            const fullNote = `Card Message: ${cardMessage || ''}\nHide Giver's Name: ${hideGiverName ? 'Yes' : 'No'}\nImportant Note: ${importantNote || ''}`;

            // Format date time
            const formattedDateTime = recipientInfo.date && recipientInfo.time
                ? `${dayjs(recipientInfo.date).format('YYYY-MM-DD')}T${dayjs(recipientInfo.time).format('HH:mm:ss')}`
                : null;

            const orderData = {
                promotionId: selectedVoucher || null,
                note: fullNote,
                storeId: selectedStore,
                recipientName: recipientInfo.name || formValues.recipientName,
                recipientTime: formattedDateTime,
                phone: recipientInfo.phone || formValues.recipientPhone,
                status: "Pending",
                transfer: selectedDeposit === "100", // 100% -> true, 50% -> false
                delivery: shippingMethod === 'shop-shipping' && deliveryCheckResult?.success,
                ...(shippingMethod === 'shop-shipping' && {
                    deliveryDistrict: formValues.district,
                    deliveryCity: "Hồ Chí Minh",
                    deliveryAddress: formValues.detailedAddress,
                }),
                orderDetails: cartItems ?
                    cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity
                    })) :
                    [{
                        productId: productInfo.productId,
                        quantity: productInfo.selectedQuantity
                    }],
                wallet: paymentMethod === 'flower-wallet' // Set useWallet based on payment method
            };

            console.log('Order Data:', orderData);

            // Create order using ConvertCartToOrder API
            const orderResponse = await axios.post(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Order/CreateOrder?CustomerId=${customerId}`,
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (orderResponse.status === 200) {
                message.success('Order created successfully!');

                const createdOrderId = orderResponse.data.orderId; // Get the orderId from response
                setOrderId(createdOrderId); // Set the orderId in state

                // Check if wallet is available
                if (paymentMethod === 'flower-wallet' && isWalletAvailable) {
                    // Show password dialog for wallet payment
                    setIsPasswordDialogVisible(true);
                } else if (paymentMethod === 'vn-pay') {
                    // Proceed with VNPay payment
                    const vnpayResponse = await axios.post(
                        'https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/VnPay/proceed-vnpay-payment',
                        createdOrderId,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (vnpayResponse.data && vnpayResponse.data.paymentUrl) {
                        sessionStorage.setItem('lastOrderId', createdOrderId);
                        window.location.href = vnpayResponse.data.paymentUrl;
                    } else {
                        message.error('Failed to get payment URL');
                        navigate('payment-failure'); // Redirect to failure page
                    }
                } else {
                    message.error('Please select a valid payment method.');
                }
            }
        } catch (error) {
            console.error('Error:', error.response?.data || error);
            message.error(
                error.response?.data?.errors ?
                    Object.values(error.response.data.errors).flat().join(', ') :
                    'Failed to process. Please try again.'
            );
            navigate('payment-failure'); // Redirect to failure page
        }
    };

    const handlePasswordSubmit = async () => {
        if (walletPassword) {
            handleWalletPayment(orderId); // Call the wallet payment function with the orderId
            setIsPasswordDialogVisible(false); // Close the dialog
        } else {
            message.error('Please enter your wallet password.');
        }
    };

    const handleWalletPayment = async (orderId) => {
        try {
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                message.error('Please login to proceed');
                return;
            }

            const response = await axios.post(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Wallet/PaymentByWallet?OrderId=${orderId}&PasswordWallet=${walletPassword}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                message.success('Payment successful!');
                navigate('/payment-success'); // Redirect to success page
            } else {
                message.error('Payment failed. Please check your password or try again.');
                navigate('/payment-failure'); // Redirect to failure page
            }
        } catch (error) {
            console.error('Error during wallet payment:', error);
            message.error('Failed to process wallet payment. Please try again.');
            navigate('/payment-failure'); // Redirect to failure page
        }
    };

    const handlePaymentChange = (id) => {
        setPaymentMethod(id); // Update the payment method state
    };

    const OptionCard = ({ id, title, description, icon, selected, onClick }) => (
        <div
            className={`border rounded-lg p-4 cursor-pointer mb-2 hover:border-pink-500 transition-all
                ${selected ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}
            onClick={() => onClick(id)}
        >
            <div className="flex items-center">
                <div className="w-12 h-12 mr-4">
                    <img src={icon} alt={title} className="w-full h-full object-contain" />
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-900">{title}</h4>
                    </div>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
        </div>
    );

    OptionCard.propTypes = {
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        selected: PropTypes.bool.isRequired,
        onClick: PropTypes.func.isRequired
    };

    const disabledTime = () => ({
        disabledHours: () => [...Array(24).keys()].filter(hour => hour < 8 || hour > 19),
    });

    const renderDeliveryCheckResult = () => {
        if (!deliveryCheckResult) return null;

        if (deliveryCheckResult.success) {
            return (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-green-600 font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Có thể đặt xe giao hàng
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-lg">
                        <span className="text-gray-600">Phí giao hàng:</span>
                        <span className="font-bold text-green-600">{deliveryCheckResult.distance.toLocaleString()} VNĐ</span>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center text-red-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>{deliveryCheckResult.message}</span>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="w-full">
            <Header />
            <Form form={form} className="w-full">
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
                <div className="container mx-auto py-10 px-20">
                    <h1 className="text-center text-6xl font-bold text-pink-600 p-3 rounded">Checkout</h1>
                    <p className="text-xl text-gray-500 mb-10 text-center">Complete Your Purchase</p>

                    <div className="mb-6 border border-gray-300 rounded">
                        <h2 className="text-xl font-semibold text-left text-black bg-pink-200 p-2 rounded">Order Information</h2>
                        <div className="space-y-4 py-5 px-10">
                            {cartItems ? (
                                // Display multiple items from cart
                                cartItems.map((item) => (
                                    <div key={item.cartId} className="flex items-center border-b border-gray-200 pb-4">
                                        <div className="w-24 h-24 flex-shrink-0">
                                            <img
                                                src={item.productImage}
                                                alt={item.productName}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        </div>
                                        <div className="flex flex-1 items-center justify-between ml-6">
                                            <div className="flex flex-col">
                                                <h3 className="text-lg font-semibold text-gray-900">{item.productName}</h3>
                                                <p className="text-sm text-gray-500">Size: {item.size}</p>
                                                <p className="text-sm text-gray-500">Category: {item.categoryName}</p>

                                            </div>
                                            <p className="text-pink-600 font-medium">{item.productPrice.toLocaleString()} VND</p>
                                            <p className="text-gray-600">x{item.quantity}</p>
                                            <p className="text-lg font-semibold text-pink-600">{item.totalPrice.toLocaleString()} VND</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Display single item from direct checkout
                                <div className="flex items-center border-b border-gray-200 pb-4">
                                    <div className="w-24 h-24 flex-shrink-0">
                                        <img
                                            src={productInfo.productImages[0]?.productImage1}
                                            alt={productInfo.productName}
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </div>
                                    <div className="flex flex-1 items-center justify-between ml-6">
                                        <div className="flex flex-col">
                                            <h3 className="text-lg font-semibold text-gray-900">{productInfo.productName}</h3>
                                            <p className="text-sm text-gray-500">Size: {productInfo.size}</p>
                                            <p className="text-sm text-gray-500">Category: {productInfo.categoryName}</p>
                                            <p className="text-sm text-gray-500">Weght: {productInfo.weight}</p>

                                        </div>
                                        <p className="text-pink-600 font-medium">{productInfo.finalPrice.toLocaleString()} VND</p>
                                        <p className="text-gray-600">x{productInfo.selectedQuantity}</p>
                                        <p className="text-lg font-semibold text-pink-600">{productInfo.totalPrice.toLocaleString()} VND</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-5 border border-gray-300 rounded">
                        <h2 className="text-xl font-semibold text-left text-black bg-pink-200 p-2 rounded">Special Note About Order</h2>
                        <div className="grid grid-cols-2 gap-10 p-4">
                            <div>
                                <h3 className="mb-2 text-left">Card/Banner Message:</h3>
                                <Form.Item name="cardMessage">
                                    <Input.TextArea />
                                </Form.Item>
                                <Form.Item name="hideGiverName" valuePropName="checked">
                                    <Checkbox
                                        onChange={(e) => {
                                            form.setFieldsValue({
                                                hideGiverName: e.target.checked
                                            });
                                        }}
                                    >
                                        Hide the giver&apos;s name
                                    </Checkbox>
                                </Form.Item>
                            </div>
                            <div>
                                <h3 className="mb-2 text-left">Important Note:</h3>
                                <Form.Item name="importantNote">
                                    <Input.TextArea />
                                </Form.Item>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between mb-6">
                        <div className="w-1/2 pr-10">
                            <div className="mb-5 border border-gray-300 rounded">
                                <h3 className="text-xl font-semibold text-left text-black bg-pink-200 p-2 rounded">Select Store</h3>
                                <p className="text-base p-3 text-gray-500 text-left">Select a store to process your order</p>
                                <div className="p-2">
                                    <Select
                                        value={selectedStore}
                                        onChange={handleStoreChange}
                                        className="w-full"
                                        placeholder="Select Store"
                                        loading={loadingStores}
                                        optionLabelProp="label"
                                    >
                                        {stores.map(store => (
                                            <Select.Option
                                                key={store.storeId}
                                                value={store.storeId}
                                                label={store.storeName}
                                            >
                                                <div className="py-2">
                                                    <div className="font-medium">{store.storeName}</div>
                                                    <div className="text-gray-500 text-sm">
                                                        {store.city}, {store.district}
                                                    </div>
                                                    <div className="text-gray-500 text-sm">
                                                        {store.address}
                                                    </div>
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div className="mb-5 border border-gray-300 rounded">
                                <h3 className="text-xl font-semibold text-left text-black bg-pink-200 p-2 rounded">Available Vouchers</h3>
                                <p className="text-base p-3 text-gray-500 text-left">Select a voucher to apply</p>
                                <div className="p-4">
                                    {loading ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                                        </div>
                                    ) : promotions.length > 0 ? (
                                        promotions.map((promotion) => (
                                            <OptionCard
                                                key={promotion.promotionId}
                                                id={promotion.promotionId}
                                                title={promotion.promotionName}
                                                description={`Valid until ${new Date(promotion.endDate).toLocaleDateString()}`}
                                                icon={promotion.image}
                                                selected={selectedVoucher === promotion.promotionId}
                                                onClick={handleVoucherChange}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500">No promotions available</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6 border border-gray-300 rounded">
                                <h2 className="text-xl font-semibold text-left text-black bg-pink-200 p-2 rounded">Order Summary</h2>
                                <div className="p-4">
                                    <p className="mb-2 text-left">Subtotal: {cartItems ? totalAmount.toLocaleString() : productInfo.totalPrice.toLocaleString()} VND</p>
                                    <p className="mb-2 text-left">Discount (Voucher): -{calculateDiscount().toLocaleString()} VND</p>
                                    <p className="mb-2 text-left">Shipping: {shippingMethod === 'store-pickup' ? '0' : (deliveryCheckResult?.success ? deliveryCheckResult.distance.toLocaleString() : '0')} VND</p>
                                    <p className="font-bold text-left">Total: {(
                                        (cartItems ? totalAmount : productInfo.totalPrice) -
                                        calculateDiscount() +
                                        (shippingMethod === 'store-pickup' ? 0 : (deliveryCheckResult?.success ? deliveryCheckResult.distance : 0))
                                    ).toLocaleString()} VND</p>
                                </div>
                            </div>

                            {isWalletAvailable && (
                                <div className="mb-5 border border-gray-300 rounded">
                                    <h3 className="text-xl font-semibold text-left text-black bg-pink-200 p-2 rounded">Payment Method</h3>
                                    <p className="text-base p-3 text-gray-500 text-left">Choose Payment method</p>
                                    <div className="p-4">
                                        <OptionCard
                                            id="vn-pay"
                                            title="VNPAY"
                                            description="Pay using VNPAY"
                                            icon="https://i.gyazo.com/4914b35ab9381a3b5a1e7e998ee9550c.png"
                                            selected={paymentMethod === 'vn-pay'}
                                            onClick={() => setPaymentMethod('vn-pay')}
                                        />

                                        <OptionCard
                                            id="flower-wallet"
                                            title="Flower Wallet"
                                            description={`Balance: ${wallet ? wallet.totalPrice : 'Loading...'}`}
                                            icon="https://img.freepik.com/premium-psd/pink-flowers-transparent-background_84443-15455.jpg"
                                            selected={paymentMethod === 'flower-wallet'}
                                            onClick={() => setPaymentMethod('flower-wallet')}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-1/2 pl-2">
                            <div className="mb-5 border border-gray-300 rounded">
                                <h3 className="text-xl font-semibold text-left text-black bg-pink-200 p-2 rounded">Shipping Method</h3>
                                <p className="text-base p-3 text-gray-500 text-left">Choose shipping method</p>
                                <div className="p-4">
                                    <OptionCard
                                        id="store-pickup"
                                        title="Store Pickup"
                                        description="Pick up your order at our store"
                                        price="Free"
                                        icon="https://static.thenounproject.com/png/4160044-200.png"
                                        selected={shippingMethod === 'store-pickup'}
                                        onClick={handleShippingChange}
                                    />

                                    <OptionCard
                                        id="shop-shipping"
                                        title="Shop Delivery"
                                        description="We will arrange delivery ourselves."
                                        price="Check"
                                        icon="https://cdn1.iconfinder.com/data/icons/logistics-transportation-vehicles/202/logistic-shipping-vehicles-002-512.png"
                                        selected={shippingMethod === 'shop-shipping'}
                                        onClick={handleShippingChange}
                                    />
                                </div>
                            </div>

                            {shippingMethod === 'store-pickup' ? (
                                <div className="mb-5 border border-gray-300 rounded">
                                    <h3 className="text-xl font-semibold mb-5 text-left text-black bg-pink-200 p-2 rounded">Add Information</h3>
                                    <Form form={form} className="p-5">
                                        <Form.Item
                                            label="Recipient Name"
                                            required
                                            rules={[{ required: true, message: 'Please input recipient name!' }]}
                                        >
                                            <Input
                                                value={recipientInfo.name}
                                                onChange={(e) => handleRecipientInfoChange('name', e.target.value)}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Recipient Phone"
                                            required
                                            rules={[{ required: true, message: 'Please input recipient phone!' }]}
                                        >
                                            <Input
                                                value={recipientInfo.phone}
                                                onChange={(e) => handleRecipientInfoChange('phone', e.target.value)}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Date and Time"
                                            required
                                            rules={[{ required: true, message: 'Please select date and time!' }]}
                                        >
                                            <div className="flex gap-2">
                                                <DatePicker
                                                    className="flex-1"
                                                    value={recipientInfo.date ? dayjs(recipientInfo.date) : null}
                                                    onChange={(date) => handleRecipientInfoChange('date', date)}
                                                    disabledDate={(current) => {
                                                        return current && current < dayjs().startOf('day');
                                                    }}
                                                />
                                                <TimePicker
                                                    className="flex-1"
                                                    format="HH:mm"
                                                    value={recipientInfo.time ? dayjs(recipientInfo.time, 'HH:mm') : null}
                                                    onChange={(time) => handleRecipientInfoChange('time', time)}
                                                    disabledTime={disabledTime}
                                                    minuteStep={30}
                                                    hideDisabledOptions
                                                />
                                            </div>
                                        </Form.Item>
                                        <Form.Item
                                            label="Deposit"
                                            required
                                            rules={[{ required: true, message: 'Please select deposit amount!' }]}
                                        >
                                            <Select
                                                value={selectedDeposit}
                                                onChange={handleDepositChange}
                                                placeholder="Select deposit amount"
                                                className="w-full"
                                            >
                                                <Select.Option value="50">50% deposit</Select.Option>
                                                <Select.Option value="100">100% payment</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Form>
                                </div>
                            ) : (

                                <div className="mb-5 border border-gray-300 rounded">
                                    <h3 className="text-xl font-semibold mb-5 text-left text-black bg-pink-200 p-2 rounded">Shipping Address</h3>
                                    <Form className="p-5">
                                        <Form.Item
                                            label="Recipient Name"
                                            required
                                            rules={[{ required: true, message: 'Please input recipient name!' }]}
                                        >
                                            <Input
                                                value={recipientInfo.name}
                                                onChange={(e) => handleRecipientInfoChange('name', e.target.value)}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Recipient Phone"
                                            required
                                            rules={[{ required: true, message: 'Please input recipient phone!' }]}
                                        >
                                            <Input
                                                value={recipientInfo.phone}
                                                onChange={(e) => handleRecipientInfoChange('phone', e.target.value)}
                                            />
                                        </Form.Item>
                                        <Form.Item label="City">
                                            <Select value="Hồ Chí Minh" disabled>
                                                <Select.Option value="Hồ Chí Minh">Hồ Chí Minh</Select.Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            name="district"
                                            label="District"
                                            rules={[{ required: true, message: 'Please select district!' }]}
                                        >
                                            <Select
                                                disabled={isAddressDisabled}
                                                placeholder="Chọn quận"
                                            >
                                                {districts.map((district) => (
                                                    <Option key={district} value={district}>
                                                        {district}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            name="detailedAddress"
                                            label="Detailed Address"
                                            rules={[{ required: true, message: 'Please input detailed address!' }]}
                                        >
                                            <Input disabled={isAddressDisabled} placeholder="Nhập địa chỉ chi tiết" />
                                        </Form.Item>
                                        <Form.Item
                                            label="Date and Time"
                                            required
                                            rules={[{ required: true, message: 'Please select date and time!' }]}
                                        >
                                            <div className="flex gap-2">
                                                <DatePicker
                                                    className="flex-1"
                                                    value={recipientInfo.date ? dayjs(recipientInfo.date) : null}
                                                    onChange={(date) => handleRecipientInfoChange('date', date)}
                                                    disabledDate={(current) => {
                                                        return current && current < dayjs().startOf('day');
                                                    }}
                                                />
                                                <TimePicker
                                                    className="flex-1"
                                                    format="HH:mm"
                                                    value={recipientInfo.time ? dayjs(recipientInfo.time, 'HH:mm') : null}
                                                    onChange={(time) => handleRecipientInfoChange('time', time)}
                                                    disabledTime={disabledTime}
                                                    minuteStep={30}
                                                    hideDisabledOptions
                                                />
                                            </div>
                                        </Form.Item>
                                        <Form.Item
                                            label="Deposit"
                                            required
                                            rules={[{ required: true, message: 'Please select deposit amount!' }]}
                                        >
                                            <Select
                                                value={selectedDeposit}
                                                onChange={handleDepositChange}
                                                placeholder="Select deposit amount"
                                                className="w-full"
                                            >
                                                <Select.Option value="50">50% deposit</Select.Option>
                                                <Select.Option value="100">100% payment</Select.Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                onClick={handleCheck}
                                                loading={isCheckingDelivery}
                                                className="w-full"
                                                style={{
                                                    backgroundColor: '#FBCFE8',
                                                    borderColor: '#FBCFE8',
                                                    color: 'black'
                                                }}
                                            >
                                                {isCheckingDelivery ? 'Checking...' : 'Check Delivery'}
                                            </Button>
                                            <p className="italic text-gray-600 text-sm text-center mt-4">
                                                * We only accept orders with a weight under 3 kg and a delivery distance under 5 km.
                                            </p>
                                        </Form.Item>
                                        {renderDeliveryCheckResult()}
                                    </Form>

                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center mt-10">
                        <Button
                            type="primary"
                            className="bg-pink-400 text-white text-2xl px-10 py-8 rounded-md"
                            onClick={handleProceedToPayment}
                        >
                            Proceed to Payment
                        </Button>
                    </div>
                </div>
            </Form>
            <Footer />
            <Modal
                title="Enter Wallet Password"
                visible={isPasswordDialogVisible}
                onOk={handlePasswordSubmit}
                onCancel={() => setIsPasswordDialogVisible(false)}
            >
                <Input.Password
                    placeholder="Enter your wallet password"
                    value={walletPassword}
                    onChange={(e) => setWalletPassword(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default Checkout;