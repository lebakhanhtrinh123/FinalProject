import React from 'react';
import { Box } from '@mui/material';
import logo from '../assets/images/logo.jpg';

const Logo = () => {
  const textColor = '#FF1493';
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <img src={logo} alt="Logo" width="180" height="50" />

      {/* <svg
        width="260"
        height="40"
        viewBox="0 0 220 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="110"
          y="25"
          fontFamily="'Georgia', serif"
          fontSize="22"
          fontWeight="600"
          textAnchor="middle"
          fill={textColor}
          letterSpacing="0.5"
        >
          Custom Flower Chain
        </text>
      </svg> */}
    </Box>
  );
};

export default Logo;