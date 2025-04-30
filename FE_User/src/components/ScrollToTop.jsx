import React, { useState, useEffect } from 'react';
import { UpOutlined } from '@ant-design/icons';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-pink-600 hover:bg-pink-700 flex items-center justify-center shadow-lg z-50 transition-all duration-300"
          aria-label="Scroll to top"
        >
          <UpOutlined className="text-white text-xl" />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;