import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from "../components/Header";
import Footer from "../components/Footer";

const ResetPasswordPage = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const email = query.get('email');
    const token = query.get('token');

    const [newPassword, setNewPassword] = useState('');

    const handleResetPassword = async () => {
        if (!newPassword) {
            message.error("Please enter your new password.");
            return;
        }

        try {
            const response = await axios.post(
                `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/auth/set-password-by-customer?email=${encodeURIComponent(email)}&NewPassword=${encodeURIComponent(newPassword)}&token=${token}`
            );

            if (response.status === 200) {
                message.success("Password has been reset successfully.");
                // Redirect to login or another page
            } else {
                message.error("Failed to reset password.");
            }
        } catch (error) {
            console.error('Error during password reset:', error);
            message.error("An error occurred. Please try again later.");
        }
    };

    return (
        <div className="bg-pink-50 w-full min-h-screen">
            <Header />
            <div className="flex justify-center items-center p-10">
                <section className="p-8 max-w-md w-full bg-white rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold mb-6 text-center">Reset Password</h1>
                    <Input.Password
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mb-4"
                    />
                    <Button type="primary" onClick={handleResetPassword} className="w-full">
                        Reset Password
                    </Button>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default ResetPasswordPage;