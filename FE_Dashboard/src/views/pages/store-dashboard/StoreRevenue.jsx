import React from 'react';
import { Box } from '@mui/material';
import TotalRevenueOfStore from 'views/dashboard/TotalRevenueOfStore';

const StoreRevenue = () => {

    return (
        <Box>
            <h2>Store's Total  Revenue Overview</h2>
            <TotalRevenueOfStore />
        </Box>
    );
};

export default StoreRevenue;
