import React, { useEffect, useState } from 'react';
import { Input, Select, Button, Avatar, message, Modal } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import Header from "../components/Header";
import Footer from "../components/Footer";
import LatestDealBG from "../assets/latestdeal.jpg";
import { jwtDecode } from "jwt-decode";

const { Option } = Select;

const UserProfile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                message.error('Please login to view your profile');
                return;
            }

            const decodedToken = jwtDecode(token);
            const customerId = decodedToken.Id;

            try {
                const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/auth/ProfileCustomer?customerId=${customerId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                if (data.statusCode === 200) {
                    setUserProfile(data.data);
                } else {
                    message.error(data.message || 'Failed to fetch profile');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                message.error('Failed to load profile');
            }
        };

        fetchUserProfile();
    }, []);

    const handleChangePassword = async () => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            message.error('Please login to change your password');
            return;
        }

        const decodedToken = jwtDecode(token);
        const customerId = decodedToken.Id;

        try {
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/auth/changedPasswordByCustomer?customerId=${customerId}&oldPassword=${oldPassword}&newPassword=${newPassword}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.statusCode === 200) {
                message.success('Password changed successfully');
                setIsChangePasswordModalVisible(false); // Đóng modal
                setOldPassword('');
                setNewPassword('');
            } else {
                message.error(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            message.error('Failed to change password');
        }
    };

    return (
        <div className="bg-pink-50 w-full min-h-screen">
            <Header />
            <section
                className="text-center py-12"
                style={{
                    backgroundImage: `url(${LatestDealBG})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <h1 className="text-5xl font-bold mb-4 mt-10">Welcome, {userProfile ? userProfile.email : 'User'}!</h1>
                <p className="text-gray-600 mb-6">Your profile displays your personal information and lets you manage your preferences with ease</p>
            </section>

            <div className="mx-auto p-10 bg-white pb-14">
                <div className="flex items-center justify-between ml-20 mr-20">
                    <div className="flex items-center space-x-4">
                        <Avatar size={100} src={userProfile?.avatar || "https://th.bing.com/th/id/R.6ff2d70af1ca52289efea67d388ca3b6?rik=qqAAMmjbRGKeKQ&riu=http%3a%2f%2fgiupban.com.vn%2fwp-content%2fuploads%2f2019%2f09%2fhinh-anh-hoa-dep-8-3-32.jpg&ehk=MqTYuImAIY06X%2fBib4xtoLJDyTlKS%2fbRdjwOk%2bLeSH8%3d&risl=&pid=ImgRaw&r=0"} />
                        <div className="p-10">
                            <h2 className="text-2xl text-left font-bold">{userProfile ? userProfile.fullName || 'No Name' : 'Loading...'}</h2>
                            <p className="text-gray-500 text-left">{userProfile ? userProfile.email : 'Loading...'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 ml-20 mr-20">
                    <div>
                        <label className="block text-left text-lg font-medium mb-3">CustomerId</label>
                        <Input placeholder="Your Full Name" className="p-3" value={userProfile?.customerId || ''} />
                    </div>
                    <div>
                        <label className="block text-left text-lg font-medium mb-3">Email</label>
                        <Input placeholder="Your Email" className="p-3" value={userProfile?.email || ''} />
                    </div>
                
                    {/* <div>
                        <label className="block text-left text-lg font-medium mb-3">Gender</label>
                        <Select
                            placeholder="Your Gender"
                            className="w-full text-pink-600 border-pink-300 h-12 text-lg bg-white"
                            style={{ textAlign: 'left' }}
                        >
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                        </Select>
                    </div> */}
                
                
                </div>

                <div className="mt-10 ml-20 mr-20">
                    <h3 className="text-xl font-semibold text-left mb-8">My Email Address</h3>
                    <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center justify-center bg-pink-100 text-white rounded-full p-4">
                            <MailOutlined className="text-2xl text-pink-500" />
                        </div>
                        <div>
                            <p className="font-medium text-left text-lg">{userProfile ? userProfile.email : 'Loading...'}</p>
                            <p className="text-gray-400 text-left text-lg">1 month ago</p>
                        </div>
                    </div>
                    <div className="flex justify-start mt-8">
                        <Button
                            type="dashed"
                            className="bg-pink-100 text-pink-500 hover:bg-pink-600 border-none text-base px-8 py-5"
                            onClick={() => setIsChangePasswordModalVisible(true)}>
                            Change Password
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Modal thay đổi mật khẩu */}
            <Modal
                title="Change Password"
                open={isChangePasswordModalVisible}
                onCancel={() => setIsChangePasswordModalVisible(false)}
                footer={null}
                className="rounded-lg"
            >
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <label className="block text-left text-lg font-medium mb-3">Old Password</label>
                    <Input.Password value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter your old password" className="mb-4" />
                    
                    <label className="block text-left text-lg font-medium mb-3">New Password</label>
                    <Input.Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter your new password" className="mb-4" />

                    <Button type="primary" onClick={handleChangePassword} className="bg-pink-400 hover:bg-pink-600 border-none text-lg px-6 py-2">
                        Change Password
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default UserProfile;