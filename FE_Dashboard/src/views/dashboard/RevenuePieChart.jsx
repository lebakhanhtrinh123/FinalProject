import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Popover,
  Paper,
  Divider
} from '@mui/material';
import { Tooltip } from 'recharts';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { X } from 'lucide-react';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#F06292', '#4DD0E1', '#FF5722', '#9C27B0'
];

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload;
//     return (
//       <Paper sx={{ p: 1.5, boxShadow: 2, bgcolor: 'background.paper', maxWidth: 200 }}>
//         <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
//           {data.storeName}
//         </Typography>
//         <Typography variant="body2" fontSize="0.85rem">
//           Doanh thu: ${data.revenue.toLocaleString()}
//         </Typography>
//       </Paper>
//     );
//   }
//   return null;
// };


// Small modal when hovering mouse over
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data && data.value !== undefined) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 2, bgcolor: 'background.paper', maxWidth: 200 }}>
          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
            {data.storeName}
          </Typography>
          <Typography variant="body2" fontSize="0.85rem">
            Revenue: {data.value !== undefined ? data.value.toLocaleString() : 'N/A'}
          </Typography>
        </Paper>
      );
    }
  }
  return null;
};


CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array
};

const RevenuePieChart = ({ storeData, isLoading }) => {
  const [chartData, setChartData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (storeData && storeData.length > 0) {
      const total = storeData.reduce((sum, store) => sum + store.revenue, 0);

      const formattedData = storeData.map((store, index) => ({
        storeId: store.storeId,
        storeName: store.storeName,
        value: store.revenue,
        city: store.city,
        district: store.district,
        address: store.address,
        percentage: (store.revenue / total) * 100,
        color: COLORS[index % COLORS.length],
      }));

      setChartData(formattedData);
      setTotalRevenue(total);
    }
  }, [storeData]);

  const handleClick = (data, index, e) => {
    setSelectedStore(data);

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    setPopoverAnchor({
      left: windowWidth * 0.3,
      top: windowHeight * 0.5,
    });
    setPopoverOpen(true);
  };

  const handleClose = () => {
    setPopoverOpen(false);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    );
  };

  const renderColorfulLegendText = (value, entry) => {
    return <span style={{ color: '#666', fontWeight: 500 }}>{value}</span>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading chart data...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h5" component="div" sx={{ mb: 2 }}>
          Revenue Distribution by Store
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          Total Chain's Revenue: ${totalRevenue.toLocaleString()}
        </Typography>

        <Box sx={{ height: 400, width: '100%' }} ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                onClick={handleClick}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                content={({ payload }) => (
                  <ul>
                    {payload.map((entry, index) => (
                      <li key={`legend-item-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: entry.color,
                            display: 'inline-block',
                            marginRight: 8,
                          }}
                        />
                        <span style={{ color: 'black', fontWeight: 400 }}>{entry.payload.storeName}</span>
                      </li>
                    ))}
                  </ul>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {selectedStore && (
          <Popover
            open={popoverOpen}
            anchorReference="anchorPosition"
            anchorPosition={popoverAnchor}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'center',
            }}
          >
            <Paper
              sx={{
                p: 2,
                width: 280,
                maxWidth: '90vw',
                boxShadow: 3,
                borderLeft: `4px solid ${selectedStore.color}`
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold">
                  {selectedStore.storeName}
                </Typography>
                <Box
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    p: 0.5,
                    borderRadius: '50%',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={handleClose}
                >
                  <X size={18} />
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <span>Revenue:</span>
                  <span style={{ fontWeight: 'bold', marginLeft: '1rem', textAlign: 'right', flex: 1 }}>${selectedStore.value.toLocaleString()}</span>
                </Typography>

                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <span>Percent in total:</span>
                  <span style={{ fontWeight: 'bold', marginLeft: '1rem', textAlign: 'right', flex: 1 }}>{selectedStore.percentage.toFixed(2)}%</span>
                </Typography>

                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <span>City:</span>
                  <span style={{ marginLeft: '1rem', textAlign: 'right', flex: 1 }}>{selectedStore.city}</span>
                </Typography>

                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <span>District:</span>
                  <span style={{ marginLeft: '1rem', textAlign: 'right', flex: 1 }}>{selectedStore.district}</span>
                </Typography>

                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <span>Address:</span>
                  <span style={{ marginLeft: '1rem', textAlign: 'right', flex: 1 }}>{selectedStore.address}</span>
                </Typography>


                <Box
                  sx={{
                    mt: 2,
                    pt: 1,
                    borderTop: '1px dashed rgba(0,0,0,0.1)',
                    fontSize: '0.8rem',
                    color: 'text.secondary'
                  }}
                >
                  <Typography variant="caption">
                    Click on the chart to see other stores
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Popover>
        )}
      </CardContent>
    </Card>
  );
};

RevenuePieChart.propTypes = {
  storeData: PropTypes.arrayOf(
    PropTypes.shape({
      storeId: PropTypes.string,
      storeName: PropTypes.string,
      revenue: PropTypes.number
    })
  ),
  isLoading: PropTypes.bool
};

RevenuePieChart.defaultProps = {
  storeData: [],
  isLoading: false
};

export default RevenuePieChart;
