import React, { useState } from 'react';
import { Card } from 'antd';
import { Link } from 'react-router-dom';
import Footer from "../components/Footer";

// Các ảnh placeholder cho từng phương thức tùy chỉnh 
const CustomizeOptions = () => {
    const [hoveredCard, setHoveredCard] = useState(null);

    const customizeOptions = [
        {
            id: 1,
            title: 'Build Your Bouquet',
            description: 'Step-by-step customization with our available options.',
            image: 'https://image.floranext.com/instances/flordel_nyc/catalog/product/b/u/build_your_own_bouquet_64a999595cec3.jpg.webp?h=700&w=700&r=255&g=255&b=255',
            link: '/customize1'
        },
        {
            id: 2,
            title: 'Share Your Idea',
            description: 'Describe your dream bouquet or upload a photo—our florists will bring it to life.',
            image: 'https://i.pinimg.com/474x/f3/ca/b0/f3cab0136c131cd45bafcdb501773556.jpg',
            link: '/customize2'
        },
        // {
        //     id: 2,
        //     title: 'Upload a Reference',
        //     description: 'Send us a photo of the bouquet you like, and we\'ll give you a quote.',
        //     image: 'https://i.pinimg.com/474x/f3/ca/b0/f3cab0136c131cd45bafcdb501773556.jpg',
        //     link: '/customize2'
        // },
        // {
        //     id: 3,
        //     title: 'Describe Your Vision',
        //     description: 'Tell us your preferences—budget, flowers, style, occasion—and we\'ll create it for you.',
        //     image: 'https://www.annsflowers.com.au/cdn/shop/products/florists-choice-2.jpg?v=1608171430',
        //     link: '/customize3'
        // }
    ];

    return (
        <div className="w-full bg-pink-50">

            <div className="relative overflow-hidden mb-8" style={{ height: "50vh", minHeight: "400px" }}>
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source src="https://res.cloudinary.com/dm4xjtgkx/video/upload/v1744662000/customizebg_mfsgkn.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40"></div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                    <h1 className="text-7xl font-bold text-white mb-4 shadow-text">CUSTOMIZE</h1>
                    <p className="text-white text-xl max-w-2xl shadow-text">
                        Choose your way to customize your floral order
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {customizeOptions.map((option) => (
                        <Link
                            to={option.link}
                            key={option.id}
                            className="block"
                        >
                            <div
                                className="relative overflow-hidden rounded-xl shadow-xl transition-all duration-300 hover:shadow-xl h-full"
                                onMouseEnter={() => setHoveredCard(option.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <div className="aspect-square">
                                    <img
                                        src={option.image}
                                        alt={option.title}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>

                                <div className="p-6 bg-white">
                                    <h3 className="text-2xl font-bold text-pink-600 mb-2">{option.title}</h3>

                                    <div
                                        className={`text-gray-600 transition-opacity duration-300 ${hoveredCard === option.id ? 'opacity-100' : 'opacity-0'
                                            }`}
                                    >
                                        {option.description}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CustomizeOptions;