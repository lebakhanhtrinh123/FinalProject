import React from 'react';
import { Box } from '@mui/material';
import TotalRevenueOfChain from 'views/dashboard/TotalRevenueOfChain';

const ChainOverview = () => {

    return (
        <Box>
            <h2>Chain's Total  Revenue Overview</h2>
            <TotalRevenueOfChain />
        </Box>
    );
};

export default ChainOverview;
