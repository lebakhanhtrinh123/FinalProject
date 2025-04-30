import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Input, Button, message } from 'antd';
import Header from "../components/Header";
import axios from 'axios';
import Footer from "../components/Footer";
import AuthPic from "../assets/authpic.jpg";
import AuthBG from "../assets/authbg.jpg";

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            message.error("Passwords do not match!");
            return;
        }

        try {
            const response = await axios.post('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/auth/register-customer-account', {
                email: email,
                password: password
            });
            if (response.data.resultStatus === 'Success') {
                message.success("Register successfully!, Check mail to verify");
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                message.error("Error: " + response.data.messages.join(' '));
            }
        } catch (error) {
            console.error("Error during registration:", error);
            message.error("Registration failed. Please try again.");
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
                    Sign In to Customize Your Dream Bouquets
                </h1>
                <p className="text-white text-left mb-6 mx-20 max-w-2xl">
                    Unlock a world of possibilities—personalize your floral designs, manage orders, and enjoy seamless delivery with just a few clicks.
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
                <section className=" p-8 max-w-md w-full">
                    <h1 className="text-6xl font-serif font-bold mt-10 mb-10 text-center">
                        Sign Up
                    </h1>
                    <Link to={"/login"} className="text-lg font-serif block text-center mb-5">
                        Already have an account? Sign In
                    </Link>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-xl text-left font-medium mb-5">Email</label>
                            <Input
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-xl text-left font-medium mb-5">Password</label>
                            <Input.Password
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirm-password" className="block text-xl text-left font-medium mb-5">Confirm Password</label>
                            <Input.Password
                                id="confirm-password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <button
                                htmlType="submit"
                                className="bg-pink-600 text-white px-10 p-2 mt-5 hover:bg-pink-800"
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default RegisterPage;