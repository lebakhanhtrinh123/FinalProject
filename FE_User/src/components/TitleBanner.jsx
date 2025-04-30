import React, { useEffect, useRef } from "react";

const ScrollingTextBanner = () => {
  const firstTextRef = useRef(null);
  const secondTextRef = useRef(null);

  const textPattern = " Custom Flower Chain  • ";
  const repeatCount = 15;
  const repeatedText = textPattern.repeat(repeatCount);

  useEffect(() => {

    if (firstTextRef.current && secondTextRef.current) {
      const width = firstTextRef.current.offsetWidth;
      
      const duration = width / 100;
      
      firstTextRef.current.style.animationDuration = `${duration}s`;
      secondTextRef.current.style.animationDuration = `${duration}s`;
    }
  }, []);

  return (
    <div className="w-full  bg-pink-50 overflow-hidden py-5 relative">
      <link 
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="scrolling-text-container relative overflow-hidden">

        <div ref={firstTextRef} className="scrolling-text whitespace-nowrap animate-marquee">
          {repeatedText}
        </div>
        
        <div ref={secondTextRef} className="scrolling-text whitespace-nowrap animate-marquee2 absolute top-0 left-0">
          {repeatedText}
        </div>
      </div>


      <style jsx>{`
        .scrolling-text-container {
          position: relative;
          width: 100%;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        
        .animate-marquee {
          animation: marquee 45s linear infinite;
          animation-fill-mode: forwards;
        }
        
        .animate-marquee2 {
          animation: marquee2 45s linear infinite;
          animation-fill-mode: forwards;
        }
        
        .scrolling-text {
          font-family: 'Caveat', serif;
          font-size: 3rem;
          color: #FF69B4;
          letter-spacing: 0.1em;
          font-weight: 500;
          display: inline-block;
          width: fit-content;
        }
        
        /* Add a subtle text shadow for more definition */
        .scrolling-text {
          text-shadow: 1px 1px 3px rgba(255, 105, 180, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ScrollingTextBanner;