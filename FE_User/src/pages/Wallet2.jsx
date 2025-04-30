import React, { useState, useEffect } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import { message, Modal, Divider, Tag, Select } from 'antd';
import { useNavigate } from 'react-router-dom';

const WalletPage = () => {
    const [wallet, setWallet] = useState(null);
    const [checkwallet, setCheckWallet] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
    const [withdrawResponseId, setWithdrawResponseId] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');
    const [bankName, setBankName] = useState('');
    const [bankNumber, setBankNumber] = useState('');
    const [reason, setReason] = useState('');
    const [otp, setOtp] = useState('');
    const [withdrawalHistory, setWithdrawalHistory] = useState([]);
    const [depositHistory, setDepositHistory] = useState([]);

    const token = localStorage.getItem('token'); // Lấy token từ localStorage

    const navigate = useNavigate();
    useEffect(() => {
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
        fetchWallet();

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
    }, [token, navigate]);

    useEffect(() => {
        const fetchWithdrawalHistory = async () => {
          
                const walletId = wallet?.walletId; // Lấy walletId từ state
                if (!walletId) return;

                const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/WithdrawMoney/GetWithDrawMoneyWithWalletId?WalletId=${walletId}`);
                const data = await response.json();

                if (data.statusCode === 200) {
                    setWithdrawalHistory(data.data); // Lưu dữ liệu vào state
                }
             
        };

        if (wallet) {
            fetchWithdrawalHistory(); // Gọi hàm khi wallet có dữ liệu
        }
    }, [wallet]);

    useEffect(() => {
        const fetchDepositHistory = async () => {
         
                const walletId = wallet?.walletId; // Lấy walletId từ state
                if (!walletId) return;

                const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/IncomeWallet/GetInComWalletByWalletId?WalletId=${walletId}`);
                const data = await response.json();

                if (data.statusCode === 200) {
                    setDepositHistory(data.data); // Lưu dữ liệu vào state
                }
            
        };

        if (wallet) {
            fetchDepositHistory(); // Gọi hàm khi wallet có dữ liệu
        }
    }, [wallet]);

    const orders = [
        {
            orderId: "#ORD001",
            details: ["Bouquet No.1", "Bouquet No.2", "Bouquet No.3"],
            price: 75,
            date: "2025-02-04",
            status: "Completed"
        },
        {
            orderId: "#ORD002",
            details: ["Bouquet No.4", "Bouquet No.5"],
            price: 50,
            date: "2025-02-03",
            status: "Processing"
        },
    ];

    const transactions = [
        {
            transactionId: "#TRX001",
            type: "Add Balance",
            amount: 500,
            status: "Success",
            date: "2025-02-04"
        },
        {
            transactionId: "#TRX002",
            type: "Withdraw",
            amount: 200,
            status: "Pending",
            date: "2025-02-03"
        },
        {
            transactionId: "#TRX003",
            type: "Payment",
            amount: -150,
            status: "Failed",
            date: "2025-02-02"
        }
    ];

    const getStatusColor = (status) => {
        const colors = {
            Success: "text-green-600 bg-green-100",
            Pending: "text-yellow-600 bg-yellow-100",
            Failed: "text-red-600 bg-red-100",
            Completed: "text-green-600 bg-green-100",
            Successfull: "text-green-600 bg-green-100",
            Failure: "text-red-600 bg-red-100",
            'request successful': "text-yellow-600 bg-yellow-100",
            Processing: "text-blue-600 bg-blue-100"
        };
        return colors[status] || "text-gray-600 bg-gray-100";
    };

    const handleCreateWallet = async () => {
        if (password !== confirmPassword) {
            message.error("Passwords do not match");
            return;
        }

        const customerId = jwtDecode(sessionStorage.getItem('accessToken')).Id;

        try {
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Wallet/CreateWallet?CusomterId=${customerId}&PasswordWallet=${password}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.statusCode === 200) {
                message.success("Wallet created successfully!");
                setIsModalVisible(false);
                // Optionally, refresh wallet data here
            } else {
                message.error(data.message || 'Failed to create wallet');
            }
        } catch (error) {
            console.error("Error creating wallet:", error);
            message.error('Failed to create wallet');
        }
    };

    const handleDeposit = async () => {
        const amount = parseInt(withdrawAmount, 10);
        if (isNaN(amount) || amount < 50000) {
            message.error("You must enter an amount greater than or equal to 50,000 VND");
            return;
        }

        const walletId = wallet.walletId; // Lấy walletId từ state

        try {
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/VnPay/Deposit-vnpay-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletId: walletId,
                    price: amount,
                }),
            });

            const data = await response.json();

            if (data.paymentUrl) {
                // Redirect to payment URL
                window.location.href = data.paymentUrl;
            } else {
                message.error(data.message || 'Failed to initiate deposit');
            }
        } catch (error) {
            console.error("Error during deposit:", error);
            message.error('Failed to process deposit');
        }
    };

    const handleWithdraw = async () => {
        const amount = parseInt(withdrawAmount, 10);
        if (isNaN(amount) || amount < 50000) {
            message.error("You must enter an amount greater than or equal to 50,000 VND");
            return;
        }

        const walletId = wallet.walletId; // Lấy walletId từ state

        try {
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/WithdrawMoney/CreateWithDrawMoney?WalletId=${walletId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    price: amount,
                    bankAccountName: bankAccountName,
                    bankName: bankName,
                    bankNumber: bankNumber,
                    reason: reason,
                    passwordWallet: password, // Mật khẩu ví
                }),
            });

            const data = await response.json();

            if (data.statusCode === 200) {
                setWithdrawResponseId(data.data); // Lưu ID để xác nhận OTP
                message.success("Withdrawal request created. Please enter the OTP.");
                // Hiển thị dialog để nhập OTP
            } else {
                message.error(data.message || 'Failed to initiate withdrawal');
            }
        } catch (error) {
            console.error("Error during withdrawal:", error);
            message.error('Failed to process withdrawal');
        }
    };

    const handleConfirmOtp = async () => {
        try {
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/WithdrawMoney/ConfirmOPT?WithdrawMoneyId=${withdrawResponseId}&otp=${otp}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.statusCode === 200) {
                message.success("Withdrawal confirmed successfully!");
                // Cập nhật lại thông tin ví hoặc thực hiện các hành động khác nếu cần
            } else {
                message.error(data.message || 'Failed to confirm OTP');
            }
        } catch (error) {
            console.error("Error confirming OTP:", error);
            message.error('Failed to confirm OTP');
        }
    };

    const handleRemove = async (withdrawMoneyId) => {
        try {
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/WithdrawMoney/DeleteWithdrawMoney?WithdrawMoneyId=${withdrawMoneyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.statusCode === 200) {
                message.success("Request successful!"); // Hiển thị thông báo thành công
                // Cập nhật lại danh sách rút tiền
                setWithdrawalHistory(prevHistory => prevHistory.filter(item => item.withdrawMoneyId !== withdrawMoneyId));
            } else {
                message.error(data.message || 'Failed to remove withdrawal');
            }
        } catch (error) {
            console.error("Error removing withdrawal:", error);
            message.error('Failed to remove withdrawal');
        }
    };

    const banks = [
        { id: '1', name: 'Ngân hàng Vietcombank', logo: 'https://example.com/vietcombank-logo.png' },
        { id: '2', name: 'Ngân hàng Techcombank', logo: 'https://example.com/techcombank-logo.png' },
        { id: '3', name: 'Ngân hàng BIDV', logo: 'https://example.com/bidv-logo.png' },
        { id: '4', name: 'Ngân hàng Agribank', logo: 'https://example.com/agribank-logo.png' },
        { id: '5', name: 'Ngân hàng ACB', logo: 'https://example.com/acb-logo.png' },
        { id: '6', name: 'Ngân hàng Sacombank', logo: 'https://example.com/sacombank-logo.png' },
        { id: '7', name: 'Ngân hàng VPBank', logo: 'https://example.com/vpbank-logo.png' },
        { id: '8', name: 'Ngân hàng MBBank', logo: 'https://example.com/mbbank-logo.png' },
        { id: '9', name: 'Ngân hàng HDBank', logo: 'https://example.com/hdbank-logo.png' },
        { id: '10', name: 'Ngân hàng Đông Á', logo: 'https://example.com/donga-logo.png' },
    ];

    return (
        <div className="w-full bg-pink-50">
            <Header />
            <div className="p-14 min-h-screen">
                {checkwallet && checkwallet.data ? (
                    <>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg w-full px-20 py-20 text-white shadow-lg relative overflow-hidden text-center">
                            <h3 className="text-2xl font-bold mb-2">Total Money</h3>
                            <p className="text-4xl font-extrabold mb-6">
                                {wallet ? `${wallet.totalPrice.toLocaleString()} VND` : 'Loading...'}
                            </p>
                            <div className="flex justify-center gap-6">
                                <button
                                    onClick={() => setIsDepositModalVisible(true)}
                                    className="bg-white text-purple-500 font-bold px-6 py-3 rounded-full shadow-md hover:bg-purple-300 hover:text-white transition">
                                    + Add Balance
                                </button>
                                <button
                                    onClick={() => setIsWithdrawModalVisible(true)}
                                    className="bg-white text-purple-500 font-bold px-6 py-3 rounded-full shadow-md hover:bg-purple-300 hover:text-white transition">
                                    - Withdraw
                                </button>
                            </div>
                        </div>

                        <div className="grid mt-10">
                            <div className="bg-white rounded-lg shadow-md p-6 mb-10">
                                <h2 className="text-3xl text-left text-pink-400 font-bold mb-5">Wallet History</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-pink-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Income Wallet ID</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Order ID</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Method</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Date Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {depositHistory.map((deposit) => (
                                                <tr key={deposit.incomeWalletID}>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap text-base">{deposit.incomeWalletID}</td>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap text-base">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(deposit.incomePrice)}
                                                    </td>                                                    <td className="px-6 py-4 text-left whitespace-nowrap text-base">{deposit.orderId}</td>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap text-base">{deposit.method}</td>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-base rounded-full ${getStatusColor(deposit.status)}`}>
                                                            {deposit.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap text-base">{new Date(deposit.createAt).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-3xl text-left text-pink-400 font-bold mb-5">Withdrawal History</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-pink-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Withdraw ID</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Bank Account Name</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Bank Name</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Bank Number</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Reason</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {withdrawalHistory.map((withdrawal) => (
                                                <tr key={withdrawal.withdrawMoneyId}>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap text-base">{withdrawal.withdrawMoneyId}</td>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap text-base">{withdrawal.price} VND</td>
                                                    
                                                    <td className="px-6 py-4 text-left whitespace-nowrap text-base">{withdrawal.bankAccountName}</td>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap text-base">{withdrawal.bankName}</td>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap text-base">{withdrawal.bankNumber}</td>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap text-base">{withdrawal.reason}</td>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-base rounded-full ${getStatusColor(withdrawal.status)}`}>
                                                            {withdrawal.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-left whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleRemove(withdrawal.withdrawMoneyId)}
                                                            className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <h2 className="text-2xl font-bold text-pink-500 mb-4">Wallet Not Set Up</h2>
                        <button
                            onClick={() => setIsModalVisible(true)}
                            className="bg-pink-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-pink-600 transition">
                            Set up Wallet
                        </button>
                    </div>
                )}
            </div>
            <Footer />
            <Modal
                title="Set Up Wallet"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <div>
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border rounded p-2 w-full mb-4"
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border rounded p-2 w-full mb-4"
                    />
                    <button
                        onClick={handleCreateWallet}
                        className="bg-pink-500 text-white px-4 py-2 rounded"
                    >
                        Create Wallet
                    </button>
                </div>
            </Modal>

            {/* Modal for Withdraw */}
            <Modal
                title="Withdraw Money"
                visible={isWithdrawModalVisible}
                onCancel={() => setIsWithdrawModalVisible(false)}
                footer={null}
            >
                <div>
                    <input
                        type="number"
                        placeholder="Enter Amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="border rounded p-2 w-full mb-4"
                    />
                    <Select
                        placeholder="Chọn Ngân Hàng"
                        onChange={(value) => setBankName(value)}
                        className="border rounded p-2 w-full mb-4"
                        dropdownRender={menu => (
                            <>
                                {menu}
                            </>
                        )}
                    >
                        {banks.map((bank) => (
                            <Select.Option key={bank.id} value={bank.name}>
                                <div className="flex items-center">
                                    <img src={bank.logo} alt={bank.name} style={{ width: 20, height: 20, marginRight: 8 }} />
                                    {bank.name}
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                    <input
                        type="text"
                        placeholder="Bank Account Name"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        className="border rounded p-2 w-full mb-4"
                    />
                    <input
                        type="text"
                        placeholder="Bank Number"
                        value={bankNumber}
                        onChange={(e) => setBankNumber(e.target.value)}
                        className="border rounded p-2 w-full mb-4"
                    />
                    <input
                        type="text"
                        placeholder="Reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="border rounded p-2 w-full mb-4"
                    />
                    <input
                        type="password"
                        placeholder="Wallet Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border rounded p-2 w-full mb-4"
                    />
                    <button
                        onClick={handleWithdraw}
                        className="bg-pink-500 text-white px-4 py-2 rounded"
                    >
                        Withdraw
                    </button>
                </div>
            </Modal>

            {/* Modal for OTP Confirmation */}
            <Modal
                title="Confirm OTP"
                visible={!!withdrawResponseId} // Hiển thị nếu có ID phản hồi
                onCancel={() => setWithdrawResponseId('')}
                footer={null}
            >
                <div>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="border rounded p-2 w-full mb-4"
                    />
                    <button
                        onClick={handleConfirmOtp}
                        className="bg-pink-500 text-white px-4 py-2 rounded"
                    >
                        Confirm OTP
                    </button>
                </div>
            </Modal>

            {/* Modal for Withdraw */}
            <Modal
                title="Deposit Money"
                visible={isDepositModalVisible}
                onCancel={() => setIsDepositModalVisible(false)}
                footer={null}
            >
                <div>
                    <input
                        type="number"
                        placeholder="Enter Amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="border rounded p-2 w-full mb-4"
                    />
                    <button
                        onClick={handleDeposit}
                        className="bg-pink-500 text-white px-4 py-2 rounded"
                    >
                        Deposit
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default WalletPage;
