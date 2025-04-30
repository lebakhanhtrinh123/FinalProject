import React from 'react';
import { Divider } from 'antd';
import { FacebookOutlined, InstagramOutlined, TwitterOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import FooterBG from "../assets/footerbg.jpg";

const Footer = () => {
  return (
    <footer
      className="bg-gray-800 text-white p-20 bg-cover bg-center"
      style={{ backgroundImage: `url(${FooterBG})` }}
    >
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8 px-4">

        <div className="space-y-4">
          <div className="flex text-left items-center gap-2">
            <PhoneOutlined className="text-pink-500" />
            <p>+00 123456789</p>
          </div>
          <div className="flex text-left items-center gap-2">
            <MailOutlined className="text-pink-500" />
            <p>contact@customflowerchain.com</p>
          </div>
          <div className="flex text-left items-center gap-2">
            <EnvironmentOutlined className="text-pink-500" />
            <p>123 Flower Street, Garden City</p>
          </div>
        </div>

        <div className="col-span-2 flex flex-col justify-between text-center space-y-4">
          <h2 className="text-4xl font-bold text-pink-500 font-serif">CustomFlowerChain</h2>
          <div className="flex justify-center gap-6 text-3xl mt-6">
            <FacebookOutlined />
            <InstagramOutlined />
            <TwitterOutlined />
          </div>
        </div>

        <div className="flex text-left flex-col justify-end text-sm">
          <p className="mb-4 break-words">
            A third party person or company should never use the Philips logo without the written permission of the copyright.
          </p>
        </div>
      </div>

      <Divider className="border-gray-500" />

      <div className="text-center text-sm text-gray-400">
        <p>© 2025 @customflowerchain, all right reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
