import React, { useState, useEffect } from 'react';

// import Banner1 from "../assets/banner1.jpg";
// import Banner2 from "../assets/banner2.jpg";
// import Banner3 from "../assets/banner3.jpg";
// import Banner4 from "../assets/banner4.jpg";

const BannerCarousel = () => {
  // const bannerImages = [Banner1, Banner2, Banner3, Banner4];

  const bannerImages = [
    "https://res.cloudinary.com/dm4xjtgkx/image/upload/v1743843366/homebanner1_v7v86x.jpg",
    "https://res.cloudinary.com/dm4xjtgkx/image/upload/v1743843369/homebanner2_ykthw7.jpg",
    "https://res.cloudinary.com/dm4xjtgkx/image/upload/v1743843370/homebanner3_tpfrlx.jpg",
    "https://res.cloudinary.com/dm4xjtgkx/image/upload/v1743843372/homebanner4_meewl1.jpg",
    "https://res.cloudinary.com/dm4xjtgkx/image/upload/v1743843366/homebanner5_hqmc5a.jpg",
    "https://res.cloudinary.com/dm4xjtgkx/image/upload/v1743843369/homebanner6_zevuq9.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  return (
    <div className="relative w-full h-96 overflow-hidden">

      {bannerImages.map((image, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={image}
            alt={`Banner ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default BannerCarousel;