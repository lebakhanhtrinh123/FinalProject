import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CloseCircleOutlined } from '@ant-design/icons';

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-pink-50 flex flex-col">
            <Header />
            
            <div className="flex-grow flex items-center justify-center py-20">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
                    <CloseCircleOutlined className="text-6xl text-red-500 mb-4" />
                    
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Payment Failed
                    </h1>
                    
                    <p className="text-gray-600 text-lg mb-6">
                        We're sorry, but your payment could not be processed at this time.
                    </p>
                    
                    <div className="border-t border-gray-200 my-6 pt-6">
                        <p className="text-gray-500 mb-6">
                            Possible reasons for payment failure:
                            <ul className="list-disc text-left pl-8 mt-4">
                                <li>Insufficient funds in your account</li>
                                <li>Bank server timeout</li>
                                <li>Connection issues during payment</li>
                                <li>Card verification failed</li>
                            </ul>
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                            type="primary"
                            size="large"
                            danger
                            onClick={() => {
                                const orderId = sessionStorage.getItem('lastOrderId');
                                if (orderId) {
                                    navigate('/checkout');
                                }
                            }}
                        >
                            Try Again
                        </Button>
                        
                        <Button
                            size="large"
                            onClick={() => navigate('/home')}
                        >
                            Return to Home
                        </Button>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default PaymentFailure; 