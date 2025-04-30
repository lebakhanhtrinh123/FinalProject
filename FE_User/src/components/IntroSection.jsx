import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";

const IntroSection = () => {
    const containerRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePosition({ x: 0.5, y: 0.5 });
    };

    const products = [
        {
            id: 1,
            title: "A Bloom for Every Moment – Explore Our Floral Collection",
            image: "https://images.squarespace-cdn.com/content/v1/5ce4172ca530d90001640de2/1736407664755-2NQ41Q43IILOT633XCZM/A+display+of+bouquet+of+flowers+for+valentines+for+customers+to+choose+from+in+Singapore.png",
            altImage: "Collection of flower bouquets ",
            link: "/product"
        },
        {
            id: 2,
            title: "Your Flowers, Your Way – Custom Bouquets Made for You",
            image: "https://media.timeout.com/images/106083082/750/422/image.jpg",
            altImage: "Custom flower bouquets",
            link: "/customize"
        }
    ];

    return (
        <div
            ref={containerRef}
            className="relative py-10 bg-pink-50 overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="container mx-auto px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="relative overflow-hidden rounded-xl shadow-lg h-96 group bg-white transition-transform duration-300 ease-out"
                            style={{
                                transform: `translate(${(mousePosition.x - 0.5) * 10}px, ${(mousePosition.y - 0.5) * 10}px)`,
                            }}
                        >
                            <div
                                className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out"
                                style={{
                                    transform: `translate(${(mousePosition.x - 0.5) * -20}px, ${(mousePosition.y - 0.5) * -20}px)`,
                                }}
                            >
                                <img
                                    src={product.image}
                                    alt={product.altImage}
                                    className="object-cover w-full h-full transform scale-110"
                                />
                            </div>

                            <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <h1 className="text-white text-3xl font-bold mb-2">{product.title}</h1>
                                <Link to={product.link}>
                                    <button className="bg-pink-600 text-white font-semibold px-5 p-2 border border-pink-500 rounded-2xl hover:bg-pink-800">
                                        Learn More
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IntroSection;