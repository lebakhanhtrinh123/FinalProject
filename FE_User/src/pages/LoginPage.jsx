import React, { useState } from 'react'; 
import { Link } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Input, message } from 'antd';
import axios from 'axios';
import AuthPic from "../assets/authpic.jpg";
import AuthBG from "../assets/authbg.jpg";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            message.error("Email and password are required!");
            return;
        }

        try {
            const response = await axios.post('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/auth/login', {
                email: email,
                password: password
            });
            
            if (response.data.resultStatus === 'Success') {
                const { accessToken, id, email } = response.data.data;
                const { roleName } = response.data;

                // Lưu thông tin vào sessionStorage
                sessionStorage.setItem("accessToken", accessToken);
                sessionStorage.setItem("userId", id);
                sessionStorage.setItem("userRole", roleName);
                sessionStorage.setItem("userEmail", email);

                // Kiểm tra role
                if (roleName === "Customer") {
                    message.success("Login successfully! Welcome Customer");
                    window.location.href = "/home";
                } else {
                    message.error("Access denied: Customer role required");
                    sessionStorage.clear(); // Xóa thông tin nếu không phải customer
                }
            } else {
                message.error("Login failed: " + response.data.messages.join(' '));
            }
        } catch (error) {
            console.error("Error during login:", error);
            message.error("Login failed. Please try again.");
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
                <section className="p-8 max-w-md w-full">
                    <h1 className="text-6xl font-serif font-bold mt-10 mb-10 text-center">
                        Sign In
                    </h1>
                    <Link to={"/register"} className="text-lg font-serif block text-center mb-5">
                        Don&apos;t have an account? Sign Up
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
                            <button
                                type="submit"
                                className="bg-pink-600 text-white px-10 p-2 mt-5 hover:bg-pink-800"
                            >
                                Sign In
                            </button>
                            <Link 
                                to="/register"
                                className="bg-pink-600 text-white px-10 p-2 mt-5 ml-4 hover:bg-pink-800 inline-block"
                            >
                                Register
                            </Link>
                        </div>
                        <div className="text-right text-gray-600 text-sm mt-5">
                            <Link to={"/forgotpassword"} className="hover:text-gray-800">Forgot your password?</Link>
                        </div>
                    </form>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default LoginPage;