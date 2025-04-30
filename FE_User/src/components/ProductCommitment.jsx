import React from 'react';
import { CheckCircleOutlined, GiftOutlined, CameraOutlined } from '@ant-design/icons';
import { Divider } from 'antd';

const ProductCommitment = () => {
  return (
    <div className="bg-white rounded-lg p-6 border border-pink-200 h-full overflow-y-auto">
      <div className="flex items-center mb-3">
        <div className="w-1 h-6 bg-pink-500 mr-3"></div>
        <h2 className="text-xl font-bold text-left">Offers & Commitments</h2>
      </div>

      <div className="text-left">
        <p className="mb-4">
          <span className="font-semibold">Exclusive offers and commitments</span> only at <span className="font-bold text-pink-600">Custom Flower Chain</span> when placing an order:
        </p>

        <div className="mb-2 flex items-start">
          <div>
            <span className="font-semibold">1) Free birthday card worth 20,000 VND</span> for gift orders (flowers, cakes).
          </div>
        </div>

        <div className="mb-2">
          <p className="font-semibold mb-2">
          <span className="font-semibold">2) COMMITMENTS FROM</span> <span className="font-bold text-pink-600">CUSTOM FLOWER CHAIN:</span>
          </p>
          <ul className="list-none pl-6">
            <li className="mb-1 flex items-start">
              <CheckCircleOutlined className="text-pink-500 mr-2 mt-1" />
              <span>Order photos sent before delivery.</span>
            </li>
            <li className="mb-1 flex items-start">
              <CheckCircleOutlined className="text-pink-500 mr-2 mt-1" />
              <span>100% refund if there is an order issue.</span>
            </li>
            <li className="mb-1 flex items-start">
              <CheckCircleOutlined className="text-pink-500 mr-2 mt-1" />
              <span>Order status updates via App / Email.</span>
            </li>
          </ul>
        </div>

        <div className="flex items-start mb-4">
          <div>
            <span className="font-semibold">3) Reward points</span> for customers referred by you.
          </div>
        </div>

        <Divider className="my-4 border-pink-500" />

        <div className="bg-pink-200 p-3 rounded-md flex items-start">
          <CameraOutlined className="text-lg mr-2 text-pink-600 mt-1" />
          <span className="text-gray-700">Photos of the final product will be sent before delivery.</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCommitment;