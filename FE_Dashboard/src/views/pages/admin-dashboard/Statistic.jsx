import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Grid,
    Typography,
    Card,
    CardContent,
    Box,
    CircularProgress,
    Container
} from '@mui/material';
import { PieChart, BarChart } from 'lucide-react';
import RevenuePieChart from '../../dashboard/RevenuePieChart';

const Statistic = () => {
    const [storeData, setStoreData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const baseUrl = 'https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api';

    const fetchStoreData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${baseUrl}/Revenue/GetAllStoreRevenue`);

            if (response.status === 200 && response.data.data) {
                setStoreData(response.data.data);
            } else {
                setError('Unable to load store data. Please try again later.');
            }
        } catch (error) {
            console.error('Error loading store data:', error);
            setError('Unable to load store data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStoreData();
    }, []);

    // Data Sample
    useEffect(() => {
        if (error || (storeData.length > 0 && storeData.every(store => store.revenue === 0))) {
            const sampleData = [
                { storeId: 'd00fd877-6288-46ec-b324-7865aea14f6c', storeName: 'Store Quận 3', city: 'Hồ Chí Minh', district: 'Quận 3', address: '185 B1 Đ. Võ Thị Sáu, Phường Võ Thị Sáu', revenue: 3612530 }
            ];
            setStoreData(sampleData);
            if (error) {
                console.log('Using sample data due to API error');
            }
        }
    }, [error, storeData]);

    return (
        <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h3" component="h1" sx={{ mb: 4 }}>
                Chain Statistics
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#ffe6ec' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                                <PieChart size={24} color="#1976d2" />
                                <Typography variant="h6" sx={{ ml: 1 }}>Chart</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                View different visualizations of your store chain's performance.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#ffe6ec' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                                <BarChart size={24} color="#1976d2" />
                                <Typography variant="h6" sx={{ ml: 1 }}>Performance</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Compare sales, profits and losses between stores.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', bgcolor: '#ffe6ec' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Summary</Typography>
                            {isLoading ? (
                                <Box display="flex" justifyContent="center">
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    <Typography variant="body1">
                                        Total Number of Stores: {storeData.length}
                                    </Typography>
                                    <Typography variant="body1">
                                        Total Chain Revenue: ${storeData.reduce((sum, store) => sum + store.revenue, 0).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body1">
                                        Best Performance Store: {
                                            storeData.length > 0
                                                ? storeData.reduce((max, store) => max.revenue > store.revenue ? max : store).storeName
                                                : 'N/A'
                                        }
                                    </Typography>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <RevenuePieChart
                        storeData={storeData}
                        isLoading={isLoading}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Statistic;
