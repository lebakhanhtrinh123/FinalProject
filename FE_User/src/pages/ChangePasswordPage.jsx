import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import axios from 'axios';
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthPic from "../assets/authpic.jpg";
import AuthBG from "../assets/authbg.jpg";

const ChangePasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');

    const location = useLocation(); 

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailFromURL = params.get('email');
        const tokenFromURL = params.get('token');
        
        if (emailFromURL && tokenFromURL) {
            setEmail(emailFromURL);  
            setToken(tokenFromURL);  
        }
    }, [location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            message.error("Passwords do not match!");
            return;
        }

        if (!email || !token) {
            message.error("Invalid reset request.");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:5243/api/auth/set-password-by-customer`,
                null,
                {
                    params: {
                        email: email,
                        NewPassword: password,
                        token: token
                    }
                }
            );

            if (response.status === 200) {
                message.success("Password reset successfully.");
                setTimeout(() => {
                    window.location.href = "/login";  
                }, 2000);
            } else {
                message.error("Failed to reset password.");
            }

            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error during password reset:', error);
            message.error("An error occurred. Please try again.");
        }
    };

    return (
        <div className="bg-pink-50 w-full min-h-screen">
            <Header />
            <section
                className="text-center py-12"
                style={{
                    backgroundImage: `url(${AuthPic})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <h1 className="text-6xl text-white text-left font-bold mt-10 mb-10 mx-20 max-w-2xl">
                    Change Password
                </h1>
                <p className="text-white text-left mb-6 mx-20 max-w-2xl">
                    Enter your new password to reset your account access.
                </p>
            </section>

            <div
                className="flex justify-center items-center"
                style={{
                    backgroundImage: `url(${AuthBG})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    padding: '40px 0',
                }}
            >
                <section className="p-8 max-w-md w-full">
                    <h1 className="text-6xl font-serif font-bold mt-10 mb-10 text-center">
                        Reset Password
                    </h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-xl text-left font-medium mb-5">New Password</label>
                            <Input.Password
                                id="password"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirm-password" className="block text-xl text-left font-medium mb-5">Confirm Password</label>
                            <Input.Password
                                id="confirm-password"
                                placeholder="Re-enter your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <button
                                htmlType="submit"
                                className="bg-pink-600 text-white px-10 p-2 mt-5 hover:bg-pink-800"
                            >
                                Reset Password
                            </button>
                        </div>
                    </form>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default ChangePasswordPage;
