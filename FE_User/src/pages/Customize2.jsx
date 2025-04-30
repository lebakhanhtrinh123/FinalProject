import React, { useState, useEffect } from "react";

import {
    Button,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    message,
    Card,
    Typography,
    Divider,
    Space
} from "antd";
import { UploadOutlined, SendOutlined, PictureOutlined, ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import Footer from "../components/Footer";
const { Option } = Select;
import { jwtDecode } from "jwt-decode";

const { Title, Text } = Typography;
const { TextArea } = Input;

const budgetOptions = [
    { label: '100,000 - 200,000 VND', value: '100000-200000' },
    { label: '200,000 - 300,000 VND', value: '200000-300000' },
    { label: '300,000 - 500,000 VND', value: '300000-500000' },
    { label: '500,000 - 1,000,000 VND', value: '500000-1000000' },
];

const Customize2 = () => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const fetchStores = async () => {
        try {
            const response = await fetch('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Store/GetAllStore');
            const data = await response.json();
            if (data.statusCode === 200) {
                setStores(data.data); // lưu danh sách store vào state
            } else {
                message.error('Failed to load stores');
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
            message.error('Failed to load stores');
        }
    };
    const createDesignCustom = async (storeId, values) => {
        const formData = new FormData();
        formData.append('RequestFlowerType', values.flowerType);
        formData.append('RecipientName', values.name  );
        formData.append('RequestImage', imageFile); // Đây mới là file thực
        formData.append('RequestDescription', values.description );
        formData.append('Phone', values.phone );
        formData.append('Note', values.note || null);
        formData.append('RequestOccasion', values.occasion);
        formData.append('RequestPrice', values.price);
        formData.append('RequestMainColor', values.mainColor);
        formData.append('StoreId', storeId);
        formData.append('RequestCard', values.card );

        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            message.error('Please login to proceed');
            navigate('/login');
            return;
        }

        const decodedToken = jwtDecode(token);
        const customerId = decodedToken.Id;
        try {
            const response = await fetch(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/DesignCustom/CreateDesignCustomByCustomer?customerId=${customerId}`, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                },
                body: formData,
            });
    
            const result = await response.json();
            if (result.statusCode === 200) {
                message.success('Design custom created successfully!');
                navigate('/request-custom-history');
            } else {
                message.error('Failed to create design custom');
            }
        } catch (error) {
            console.error('Error creating design custom:', error);
            message.error('Failed to create design custom');
        }
    };
    useEffect(() => {
        fetchStores();
        createDesignCustom();
    }, []);
    const handleImageUpload = (info) => {
        if (info.file.status === 'done' || info.file.status === 'uploading') {
            const file = info.file.originFileObj;
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result); // dùng để hiển thị hình ảnh
            };
            if (file) {
                reader.readAsDataURL(file);
                setImageFile(file); // Lưu file thực
            }
        }
    };
    

    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("You can only upload image files!");
        }
        return isImage;
    };

    const handleDeleteImage = () => {
        setImageUrl(null);
        message.success("Image deleted successfully!");
    };

    const onFinish = (values) => {
        if (!imageUrl && !values.description && !values.price) {
            message.info("Please provide at least one piece of information about your bouquet!");
            return;
        }

        const storeId = values.store;
        createDesignCustom(storeId, values);
    };

    const dummyRequest = ({ onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    };

    return (
        <div className="w-full bg-pink-50">
            <div className="flex ml-20 py-10">
                <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    className="bg-pink-300 text-white text-lg px-6 py-5 rounded-md shadow-md"
                    onClick={() => navigate(-1)}
                >
                    BACK
                </Button>
            </div>
            <h1 className="text-center text-6xl font-bold text-pink-600 p-3 rounded">Share Your Idea</h1>
            <p className="text-xl text-gray-500 mb-10 text-center">Describe your dream bouquet or upload a photo—our florists will bring it to life.</p>

            <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg mx-10 mb-20 p-10 gap-6">

                {/* Picture Part */}
                <div className="w-full md:w-1/2 flex flex-col p-6">
                    <Card className="flex-grow flex flex-col items-center justify-center overflow-hidden">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="Sample bouquet image"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 w-64 text-gray-400 border-2 border-dashed border-gray-300 rounded-md">
                                <PictureOutlined style={{ fontSize: 48 }} />
                                <Text className="mt-2">Sample bouquet image</Text>
                            </div>
                        )}
                    </Card>

                    <div className="mt-4 flex gap-2">
                        <Upload
                            name="flowerImage"
                            listType="text"
                            showUploadList={false}
                            customRequest={dummyRequest}
                            beforeUpload={beforeUpload}
                            onChange={handleImageUpload}
                            className="flex-1"
                        >
                            <Button
                                icon={<UploadOutlined />}
                                loading={loading}
                                className="w-full"
                                size="large"
                            >
                                Upload sample bouquet image
                            </Button>
                        </Upload>

                        <Button
                            icon={<DeleteOutlined />}
                            onClick={handleDeleteImage}
                            className="w-40"
                            size="large"
                            danger
                            disabled={!imageUrl}
                        >
                            Delete image
                        </Button>
                    </div>
                </div>

                {/* Description Part */}
                <div className="w-full md:w-1/2 p-6">
                    <h1 className="text-center text-3xl font-bold text-pink-600 p-3 rounded">Bouquet Information</h1>
                    <Text className="text-gray-500 mb-4 block">
                        Please provide more information about the bouquet you would like to order. All fields are optional.
                    </Text>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >

                        <Form.Item name="price" label="Estimated budget (VND)">
                            <Select placeholder="Select estimated budget" className="w-full">
                                {budgetOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="occasion" label="Occasion">
                            <Input
                                placeholder="Ex: Birthday, Anniversary, Love..."
                            />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item name="mainColor" label="Main Color">
                                <Input
                                    placeholder="Ex: Red, Pink, Pastel..."
                                />
                            </Form.Item>

                            <Form.Item name="flowerType" label="Flower Type">
                                <Input
                                    placeholder="Ex: Rose, Sunflower, Lily..."
                                />
                            </Form.Item>
                        </div>

                        <Form.Item name="card" label="Card">
                            <Input placeholder="store content (if any)" />
                        </Form.Item>
                        <Form.Item name="name" label="Recipient Name">
                            <Input placeholder="name content (if any)" />
                        </Form.Item>
                        <Form.Item name="phone" label="Consulting phone number">
                            <Input placeholder="phone content (if any)" />
                        </Form.Item>

                        <Form.Item name="store" label="Store">
                            <Select placeholder="Select a store" className="w-full" showSearch optionFilterProp="children">
                                {stores.map((store) => (
                                    <Option key={store.storeId} value={store.storeId}>
                                        {`${store.storeName} - ${store.district}, ${store.city}`}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="description" label="Description">
                            <TextArea
                                rows={4}
                                placeholder="Describe in detail the bouquet you desire, any special requests or additional information."
                            />
                        </Form.Item>

                        <Divider />

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SendOutlined />}
                                size="large"
                                className="bg-pink-400 text-white text-xl px-8 py-6 rounded-md"
                            >
                                Send Request
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Customize2;