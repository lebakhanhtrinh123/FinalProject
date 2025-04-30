import React from "react";
import VoucherBackground from "../assets/voucherbg.jpg";
import { Button } from 'antd';
const VoucherCard = ({ title, description, buttonText }) => {
  return (
    <div
      className="bg-pink-100 shadow-md p-6"
      style={{
        backgroundImage: `url(${VoucherBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="p-6 rounded-lg opacity-90">
        <p className="text-lg text-gray-600 font-serif text-left mb-3">{description}</p>
        <h1 className="text-3xl font-bold font-sans text-left mb-5 py-2">{title}</h1>
        <button className="bg-pink-600 text-white px-6 p-2 hover:bg-pink-800">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default VoucherCard;

