import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import axios from 'axios';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid, Typography } from '@mui/material';

// third-party
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

// project imports
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// chart data
import baseChartData from './chart-data/total-growth-bar-chart';

const TotalGrowthBarChart = ({ isLoading, storeId }) => {
  const theme = useTheme();
  const [chartData, setChartData] = useState(baseChartData);
  const [totals, setTotals] = useState({
    revenue: 0,
    loss: 0,
    profit: 0
  });

  const fetchData = async () => {
    if (!storeId) return;

    try {
      const [revenueResponse, lossResponse] = await Promise.all([
        axios.get(
          `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Revenue/GetRevenueByStoreId?storeId=${storeId}`
        ),
        axios.get(
          `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Revenue/GetLossByStoreId?storeId=${storeId}`
        )
      ]);
      
      if (revenueResponse.status === 200 && revenueResponse.data.data) {
        const revenueData = revenueResponse.data.data;
        const lossData = lossResponse.data.data;

        const revenueArray = [
          revenueData.january || 0,
          revenueData.february || 0,
          revenueData.march || 0,
          revenueData.april || 0,
          revenueData.may || 0,
          revenueData.june || 0,
          revenueData.july || 0,
          revenueData.august || 0,
          revenueData.september || 0,
          revenueData.october || 0,
          revenueData.november || 0,
          revenueData.december || 0
        ];

        const lossArray = [
          lossData.january || 0,
          lossData.february || 0,
          lossData.march || 0,
          lossData.april || 0,
          lossData.may || 0,
          lossData.june || 0,
          lossData.july || 0,
          lossData.august || 0,
          lossData.september || 0,
          lossData.october || 0,
          lossData.november || 0,
          lossData.december || 0
        ];

        const profitArray = revenueArray.map((revenue, index) => revenue - lossArray[index]);

        const totalRevenue = revenueArray.reduce((sum, val) => sum + val, 0);
        const totalLoss = lossArray.reduce((sum, val) => sum + val, 0);
        const totalProfit = totalRevenue - totalLoss;

        setTotals({
          revenue: totalRevenue,
          loss: totalLoss,
          profit: totalProfit
        });

        const newChartData = {
          ...baseChartData,
          series: [
            {
              name: 'Revenue',
              data: revenueArray
            },
            {
              name: 'Loss',
              data: lossArray
            },
            {
              name: 'Profit',
              data: profitArray
            }
          ]
        };
        
        setChartData(newChartData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setChartData(baseChartData);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeId]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
              <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Grid container direction="column" spacing={1}>
                    <Grid item>
                      <Typography variant="subtitle2">Total Revenue</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h3" color="success.main">
                        ${totals.revenue.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Grid container direction="column" spacing={1}>
                    <Grid item>
                      <Typography variant="subtitle2">Total Loss</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h3" color="error.main">
                        ${totals.loss.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Grid container direction="column" spacing={1}>
                    <Grid item>
                      <Typography variant="subtitle2">Total Profit</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h3" color="primary.main">
                        ${totals.profit.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Chart {...chartData} />
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool,
  storeId: PropTypes.string
};

TotalGrowthBarChart.defaultProps = {
  isLoading: false,
  storeId: ''
};

export default TotalGrowthBarChart;