import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CheckCircleOutlined } from '@ant-design/icons';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-pink-50 flex flex-col">
            <Header />
            
            <div className="flex-grow flex items-center justify-center py-20">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
                    <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
                    
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Payment Successful!
                    </h1>
                    
                    <p className="text-gray-600 text-lg mb-6">
                        Thank you for your purchase. Your payment has been processed successfully.
                    </p>
                    
                    <div className="border-t border-gray-200 my-6 pt-6">
                        <p className="text-gray-500 mb-6">
                            A confirmation email has been sent to your email address.
                            You can track your order status in your account dashboard.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                            type="primary"
                            size="large"
                            className="bg-pink-500 hover:bg-pink-600"
                            onClick={() => navigate('/orders')}
                        >
                            View Orders
                        </Button>
                        
                        <Button
                            size="large"
                            onClick={() => navigate('/')}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default PaymentSuccess; 