import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import { UserOutlined, GiftOutlined, ShopOutlined, PayCircleOutlined, ClockCircleOutlined, PictureOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import Header from "../components/Header";
import Footer from "../components/Footer";
import BannerCarousel from "../components/BannerCarousel";
import IntroSection from "../components/IntroSection";
import PromotionBanner from "../components/PromotionBanner";
import TitleBanner from "../components/TitleBanner";
import ChatBox from "../components/ChatBox";
import ScrollToTop from "../components/ScrollToTop";
import Flower1 from "../assets/homepic1.jpg";
import Flower2 from "../assets/homepic2.jpg";
import Flower3 from "../assets/homepic3.jpg";
import Homepic4 from "../assets/homepic4.jpg";
import Homepic5 from "../assets/homepic5.jpg";
import LatestDealBG from "../assets/latestdeal.jpg"

const { Paragraph } = Typography;

const Homepage = () => {
    const [firstSectionVisible, setFirstSectionVisible] = useState(false);
    const [secondSectionVisible, setSecondSectionVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const firstSection = document.getElementById("first-section");
            const secondSection = document.getElementById("second-section");

            if (firstSection) {
                const firstSectionRect = firstSection.getBoundingClientRect();
                const isFirstVisible =
                    firstSectionRect.top < window.innerHeight - 200 &&
                    firstSectionRect.bottom > 0;

                setFirstSectionVisible(isFirstVisible);
            }

            if (secondSection) {
                const secondSectionRect = secondSection.getBoundingClientRect();
                const isSecondVisible =
                    secondSectionRect.top < window.innerHeight - 200 &&
                    secondSectionRect.bottom > 0;

                setSecondSectionVisible(isSecondVisible);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="bg-pink-100 w-full">

            <Header />
            <BannerCarousel />
            <IntroSection />

            <section
                id="first-section"
                className="py-16 relative h-auto overflow-hidden"
            >
                {/* Video Bg */}
                <div className="absolute inset-0 w-full h-full">
                    <video
                        className="absolute inset-0 min-w-full min-h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        <source src="https://res.cloudinary.com/dm4xjtgkx/video/upload/v1743841595/homevid1_vfe2pv.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4">
                    <div
                        className={`space-y-10 pl-20 transition-all duration-1000 transform ${firstSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                            }`}
                    >
                        <h1 className="text-7xl text-white text-left font-bold">
                            Fresh Flowers For Any Occasion
                        </h1>
                        <Paragraph className=" text-white text-left text-base leading-relaxed">
                            Most flowering plants depend on animals, such as bees, moths, and butterflies, to transfer their pollen between different flowers, and have evolved to attract these pollinators.
                        </Paragraph>
                        <Link to="/product">
                            <button className="bg-pink-600 text-white px-10 p-2 mt-10 hover:bg-pink-800">
                                Learn More
                            </button>
                        </Link>
                        <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-6 px-10">
                            <div className="text-left text-white">
                                <h3 className="text-2xl text-white font-bold"><UserOutlined /> 250+</h3>
                                <p className="text-white">Customers Reviews</p>
                            </div>
                            <div className="text-left text-white">
                                <h3 className="text-2xl text-white font-bold"><GiftOutlined /> 100+</h3>
                                <p className="text-white">Flowers Collection</p>
                            </div>
                            <div className="text-left text-white">
                                <h3 className="text-2xl text-white font-bold"><ShopOutlined /> 5+</h3>
                                <p className="text-white">Stores</p>
                            </div>
                        </section>
                    </div>
                    <div
                        className={`relative w-full h-[300px] md:h-[600px] transition-all duration-1000 transform ${firstSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                            }`}
                        style={{ transitionDelay: '200ms' }}
                    >
                        <div className="absolute top-[0px] left-[400px] z-10">
                            <img
                                src={Flower1}
                                alt="Flower 1"
                                className="rounded-lg w-[250px] h-[250px] object-contain"
                            />
                        </div>
                        <div className="absolute top-[50px] left-[120px] md:top-[130px] md:left-[160px] z-0">
                            <img
                                src={Flower2}
                                alt="Flower 2"
                                className="rounded-lg w-[380px] h-[380px] object-contain"
                            />
                        </div>
                        <div className="absolute top-[180px] left-[50px] md:top-[400px] md:left-[50px] z-10">
                            <img
                                src={Flower3}
                                alt="Flower 3"
                                className="rounded-lg w-[250px] h-[250px] object-contain"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-12  bg-pink-50 grid grid-cols-1 md:grid-cols-4 gap-6 px-10">
                <div className="text-center">
                    <PayCircleOutlined className="text-4xl text-pink-500 mb-3" />
                    <h3 className="text-lg font-bold">Easy Payment</h3>
                    <p className="text-gray-600">Fast and secure payment methods</p>
                </div>
                <div className="text-center">
                    <ClockCircleOutlined className="text-4xl text-pink-500 mb-3" />
                    <h3 className="text-lg font-bold">Delivery On Time</h3>
                    <p className="text-gray-600">Guaranteed on-time delivery</p>
                </div>
                <div className="text-center">
                    <PictureOutlined className="text-4xl text-pink-500 mb-3" />
                    <h3 className="text-lg font-bold">Real Photos</h3>
                    <p className="text-gray-600">View actual product images</p>
                </div>
                <div className="text-center">
                    <CustomerServiceOutlined className="text-4xl text-pink-500 mb-3" />
                    <h3 className="text-lg font-bold">24/7 Customer Support</h3>
                    <p className="text-gray-600">We're always here to help</p>
                </div>
            </section>

            <PromotionBanner />

            <section
                id="second-section"
                className="py-16 relative h-auto overflow-hidden"
            >
                {/* Video Bg */}
                <div className="absolute inset-0 w-full h-full">
                    <video
                        className="absolute inset-0 min-w-full min-h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        <source src="https://res.cloudinary.com/dm4xjtgkx/video/upload/v1743841827/homevid2_yaxtx1.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4">
                    <div
                        className={`space-y-10 pl-20 transition-all duration-1000 transform ${secondSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                            }`}
                    >
                        <h1 className="text-6xl text-white text-left font-bold">
                            Create Your Perfect Floral Design
                        </h1>
                        <Paragraph className="text-white text-left text-base leading-relaxed">
                            Craft stunning flower designs tailored to your unique preferences. Choose from a wide range of blooms, styles, and personalized touches to make your bouquet truly one of a kind.
                        </Paragraph>
                        <Link to="/customize">
                            <button className="bg-pink-600 text-white px-10 mt-10 p-2 hover:bg-pink-800">
                                Try It!
                            </button>
                        </Link>
                    </div>
                    <div
                        className={`relative w-full h-[300px] md:h-[500px] transition-all duration-1000 transform ${secondSectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                            }`}
                        style={{ transitionDelay: '200ms' }}
                    >
                        <div className="absolute md:top-[0px] md:left-[150px] z-0">
                            <img
                                src={Homepic4}
                                alt="Homepic 4"
                                className="w-[500px] h-[500px] object-contain"
                            />
                        </div>
                        <div className="absolute top-[180px] left-[50px] md:top-[240px] md:left-[100px] z-10">
                            <img
                                src={Homepic5}
                                alt="Homepic 5"
                                className="w-[300px] h-[300px] object-contain"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <TitleBanner />

            {/* Subscription */}
            <section
                className="text-center py-12"
                style={{
                    backgroundImage: `url(${LatestDealBG})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <h1 className="text-5xl font-bold mb-4 mt-10">Get The Latest Deals</h1>
                <p className="text-gray-600 mb-6">Sign up now and get $10 coupon for first shopping!</p>
                <div className="inline-flex mb-10">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="border px-4 py-2"
                    />
                    <button className="bg-pink-600 text-white px-6 py-2 hover:bg-pink-800">
                        Subscribe
                    </button>
                </div>
            </section>

            {/* <ChatBox /> */}
            <ScrollToTop />
            <Footer />
        </div>
    );
};

export default Homepage;