import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Carousel, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import '../css/PromotionBanner.css';
import LatestDealBG from "../assets/latestdeal.jpg"

const { Title, Paragraph } = Typography;

const PromotionBanner = () => {
    const carouselRef = React.useRef();
    const [currentSlide, setCurrentSlide] = useState(0);

    const promotions = [
        {
            id: 1,
            title: "Wedding Anniversary",
            description: "SALE UP TO 30% OFF",
            buttonText: "Shop Now",
            bgImage: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070",
            validUntil: "March 31, 2025"
        },
        {
            id: 2,
            title: "New Year 2025",
            description: "SALE UP TO 20% OFF",
            buttonText: "Learn More",
            bgImage: "https://www.slidekit.com/wp-content/uploads/2024/11/Free-2025-Happy-New-Year-Celebration-Presentation-Template.jpg",
            validUntil: "January 15, 2025"
        },
        {
            id: 3,
            title: "Spring Collection",
            description: "NEW ARRIVALS - 15% OFF",
            buttonText: "Shop Now",
            bgImage: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2070",
            validUntil: "April 15, 2025"
        },
        {
            id: 4,
            title: "Mother's Day Special",
            description: "FREE DELIVERY",
            buttonText: "Order Now",
            bgImage: "https://static.toiimg.com/thumb/msid-110003168,width-1070,height-580,imgsize-850413,resizemode-75,overlay-toi_sw,pt-32,y_pad-40/photo.jpg",
            validUntil: "May 10, 2025"
        },
        {
            id: 5,
            title: "Birthday Bouquets",
            description: "BUY 1 GET 1 FREE",
            buttonText: "See Offers",
            bgImage: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=2080",
            validUntil: "June 30, 2025"
        },
        {
            id: 6,
            title: "Valentine's Day",
            description: "PRE-ORDER DISCOUNT 25%",
            buttonText: "Reserve Now",
            bgImage: "https://courtsofrayleigh.co.uk/wp-content/uploads/bb-plugin/cache/valentines-day-panorama-1b35f28d97179eb9d4b7d8390dc3ec76-lgvy0hoq38nw.jpg",
            validUntil: "February 10, 2025"
        }
    ];

    const nextSlide = () => {
        if (carouselRef.current) {
            carouselRef.current.next();
        }
    };

    const prevSlide = () => {
        if (carouselRef.current) {
            carouselRef.current.prev();
        }
    };

    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        beforeChange: (_, next) => setCurrentSlide(next),
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ],
        rtl: false
    };

    return (
        <section className="py-12 bg-white"
            style={{
                backgroundImage: `url(${LatestDealBG})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}>
            <div className="container mx-auto px-4">
                <h2 className="text-5xl font-bold text-gray-800 mb-3">✨ Exclusive Seasonal Deals ✨</h2>
                <p className="text-gray-600 text-lg mb-6">Unlock amazing discounts and make your moments even more special!</p>
                <div className="relative">
                    <button
                        onClick={prevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-gray-100 text-pink-600 border border-pink-200 rounded-full p-2 shadow-md transition-all duration-300"
                        aria-label="Previous promotion"
                    >
                        <ArrowLeftOutlined className="text-lg" />
                    </button>

                    <Carousel
                        ref={carouselRef}
                        afterChange={setCurrentSlide}
                        {...carouselSettings}
                        className="promotion-carousel mx-8"
                    >
                        {promotions.map((promo) => (
                            <div key={promo.id} className="px-2">
                                <div
                                    className="h-64 rounded-lg overflow-hidden flex items-center relative shadow-md transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${promo.bgImage})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                >
                                    <div className="absolute top-0 right-0 bg-pink-600 text-white px-3 py-1 text-sm rounded-bl-lg">
                                        Until: {promo.validUntil}
                                    </div>
                                    <div className="px-6 text-white w-full">
                                        <h3 className="text-white text-3xl font-bold mb-2">
                                            {promo.title}
                                        </h3>
                                        <p className="text-white text-lg mb-4">
                                            {promo.description}
                                        </p>
                                        <Link to="/product">
                                            <button className="bg-pink-600 text-white px-6 py-2 border-none hover:bg-pink-800">
                                                {promo.buttonText}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Carousel>

                    <button
                        onClick={nextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-gray-100 text-pink-600 border border-pink-200 rounded-full p-2 shadow-md transition-all duration-300"
                        aria-label="Next promotion"
                    >
                        <ArrowRightOutlined className="text-lg" />
                    </button>

                    {/* Mobile indicators (visible on small screens) */}
                    <div className="md:hidden flex justify-center mt-4">
                        {Array.from({ length: promotions.length }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => carouselRef.current?.goTo(index)}
                                className={`mx-1 w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-pink-600 w-4' : 'bg-gray-300'
                                    }`}
                                aria-label={`Go to promotion ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromotionBanner;