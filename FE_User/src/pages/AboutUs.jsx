import React, { useEffect, useState, useRef } from 'react';
import { Modal, Typography } from 'antd';
import Footer from "../components/Footer";

const { Paragraph } = Typography;

const AboutUs = () => {
    const [animate, setAnimate] = useState(false);
    const scrollContainerRef = useRef(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        setAnimate(true);
    }, []);

    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        const images = e.target.querySelectorAll('.image-item');

        images.forEach((image, index) => {
            const speed = (index % 2 === 0) ? 0.1 : 0.2;
            const offset = scrollTop * speed * (index % 3 === 0 ? 1 : -1);

            image.style.transform = `translateY(${offset}px)`;
        });
    };

    const imageData = [
        {
            src: "https://res.cloudinary.com/dm4xjtgkx/image/upload/v1743841954/ourstorypic_jr2vum.jpg",
            alt: "Story",
            title: "Our Story",
            description: "Born from a deep passion for flowers, we strive to bring the most exquisite floral arrangements for every special moment. Our journey is about crafting beauty and emotions into every bouquet."
        },
        {
            src: "https://res.cloudinary.com/dm4xjtgkx/image/upload/v1743841955/ourvisionpic_roe316.jpg",
            alt: "Vision",
            title: "Our Vision",
            description: "We aspire to be a leading floral brand, offering the perfect choice for every occasion—from elegant bouquets to personalized floral gifts that capture heartfelt emotions."
        },
        {
            src: "https://res.cloudinary.com/dm4xjtgkx/image/upload/v1743841932/ourmissionpic_wo58sf.jpg",
            alt: "Mission",
            title: "Our Mission",
            description: "Our mission is to help people express their emotions through flowers. We are committed to providing fresh, high-quality blooms and exceptional service with every order."
        },
        {
            src: "https://res.cloudinary.com/dm4xjtgkx/image/upload/v1743843446/endlessvariety_ugzkcd.jpg",
            alt: "Variety",
            title: "Endless Variety",
            description: "With a wide selection of locally sourced and imported flowers, we offer diverse styles from classic to modern, catering to every taste and occasion."
        },
        {
            src: "https://res.cloudinary.com/dm4xjtgkx/image/upload/v1743842535/customizeyourbouquet_yderbn.jpg",
            alt: "Customization",
            title: "Customize Your Bouquet",
            description: "Create your own floral arrangement with our unique customization feature. Select flowers, mix colors, and add a personal message to make your gift truly special."
        }
    ];

    const openModal = (data) => {
        setModalContent({
            title: data.title,
            description: data.description,
            image: data.src
        });
        setModalVisible(true);
    };

    return (
        <div className="flex flex-col">

            <section className="relative w-full h-screen overflow-hidden">
                {/*  Video Bg */}
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        className="object-cover w-full h-full"
                    >
                        <source src="https://res.cloudinary.com/dm4xjtgkx/video/upload/v1743841925/flowerfieldvid1_aqvo08.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>


                {/* Image */}
                <div
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 
                      w-3/5 h-4/5 overflow-y-auto pr-6 pb-4 transition-opacity duration-1000 
                      ${animate ? 'opacity-100' : 'opacity-0'}
                      hide-scrollbar`}
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    style={{
                        scrollBehavior: 'smooth',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    {/* Image Grid */}
                    <div className="grid grid-cols-3 gap-6 mx-auto p-6">
                        {imageData.map((data, index) => (
                            <div
                                key={index}
                                className="image-item cursor-pointer rounded-lg relative overflow-hidden transition-all hover:shadow-lg"
                                onClick={() => openModal(data)}
                            >
                                <div
                                    className="aspect-[2/3] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all"
                                    style={{ height: '400px' }}
                                >
                                    <img
                                        src={data.src}
                                        alt={data.alt}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 w-full p-4">
                                        <h3 className="text-white text-lg font-bold">{data.title}</h3>
                                        <p className="text-white text-sm">Click to view</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Modal */}
                <Modal
                    title={modalContent.title}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                    width={600}
                    centered
                >
                    <div className="flex flex-col items-center">
                        <img
                            src={modalContent.image}
                            alt={modalContent.title}
                            className="w-full max-h-96 object-contain mb-4"
                        />
                        <Paragraph>{modalContent.description}</Paragraph>
                    </div>
                </Modal>
            </section>


            <section className="relative w-full h-screen overflow-hidden">
                {/*  Video Bg */}
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        className="object-cover w-full h-full"
                    >
                        <source src="https://res.cloudinary.com/dm4xjtgkx/video/upload/v1743841924/flowerfieldvid2_jqeeac.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center">
                    <h2 className="text-white text-6xl font-bold drop-shadow-lg custom-font">
                        Flowers embody nature’s purest beauty and elegance.
                    </h2>
                </div>

                <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
        
        .custom-font {
          font-family: 'Dancing Script', cursive;
          letter-spacing: 1px;
        }
      `}</style>
            </section>

            <Footer />

            <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
};

export default AboutUs;