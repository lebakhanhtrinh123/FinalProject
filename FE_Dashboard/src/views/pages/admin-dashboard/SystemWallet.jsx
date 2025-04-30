import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  InputBase,
  Tabs,
  Tab,
  Chip,
  Button,
  Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Wallet,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import axios from 'axios';

// Styled components
const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 20px 0 rgba(0,0,0,0.12)',
  },
}));

const HighlightedCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 24px 0 rgba(0,0,0,0.12)',
  background: 'linear-gradient(45deg, #1a237e 0%, #283593 100%)',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 28px 0 rgba(0,0,0,0.2)',
  },
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 56,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette[color].main, 0.1),
  color: theme.palette[color].main,
}));

const WhiteIconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 64,
  height: 64,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  color: theme.palette.common.white,
}));

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  border: '1px solid',
  borderColor: theme.palette.divider,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

// Mock data
const stats = [
  { 
    title: "Revenue", 
    value: "$4,350.00", 
    icon: <AttachMoney fontSize="large" />, 
    change: "+8.1%", 
    positive: true,
    color: "success"
  },
  { 
    title: "Expenses", 
    value: "$1,250.00", 
    icon: <TrendingDown fontSize="large" />, 
    change: "+2.3%", 
    positive: false,
    color: "error"
  },
  { 
    title: "Profit", 
    value: "$3,100.00", 
    icon: <TrendingUp fontSize="large" />, 
    change: "+10.4%", 
    positive: true,
    color: "info"
  },
];

const transactions = [
  { id: 1, description: "Service payment", amount: "$320.00", date: "17/04/2025", status: "Completed", type: "Expense" },
  { id: 2, description: "Payment from Customer A", amount: "$1,200.00", date: "16/04/2025", status: "Completed", type: "Income" },
  { id: 3, description: "Payment to Partner B", amount: "$540.00", date: "15/04/2025", status: "Processing", type: "Expense" },
  { id: 4, description: "Payment from Customer C", amount: "$750.00", date: "14/04/2025", status: "Completed", type: "Income" },
  { id: 5, description: "Service payment", amount: "$120.00", date: "13/04/2025", status: "Completed", type: "Expense" },
  { id: 6, description: "Payment from Customer D", amount: "$425.00", date: "12/04/2025", status: "Completed", type: "Income" },
  { id: 7, description: "Payment to Supplier", amount: "$890.00", date: "11/04/2025", status: "Processing", type: "Expense" },
  { id: 8, description: "Payment from Customer E", amount: "$1,500.00", date: "10/04/2025", status: "Completed", type: "Income" },
];

const refunds = [
  { id: 1, description: "Refund to Customer D", amount: "$150.00", date: "16/04/2025", reason: "Product dissatisfaction", status: "Completed" },
  { id: 2, description: "Refund to Customer E", amount: "$280.00", date: "15/04/2025", reason: "Defective product", status: "Processing" },
  { id: 3, description: "Refund to Customer F", amount: "$75.00", date: "12/04/2025", reason: "Product return", status: "Completed" },
  { id: 4, description: "Refund to Customer G", amount: "$310.00", date: "10/04/2025", reason: "Product not as described", status: "Processing" },
  { id: 5, description: "Refund to Customer H", amount: "$95.00", date: "08/04/2025", reason: "Product return", status: "Completed" },
];

export default function SystemWallet() {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [refunds, setRefunds] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentData = tabValue === 0 ? transactions : refunds;
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - currentData.length) : 0;

  const fetchWalletData = async () => {
    try {
      const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Wallet/GetWalletByAdmin?id=55d9964b-8543-4b74-96d6-e0ab2ce86d3f');
      if (response.status === 200) {
        const walletData = response.data.data;
        setTotalBalance(walletData.totalPrice);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeData = async () => {
    try {
      const walletId = '55d9964b-8543-4b74-96d6-e0ab2ce86d3f';
      const incomeResponse = await axios.get(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/IncomeWallet/GetInComWalletByWalletId?WalletId=${walletId}`);
      if (incomeResponse.status === 200) {
        const incomeData = incomeResponse.data.data.filter(item => item.method === "Payment");
        setTransactions(incomeData);
      }
      if (incomeResponse.status === 200) {
        const refundData = incomeResponse.data.data.filter(item => item.method === "Refund");
        setRefunds(refundData);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    fetchIncomeData();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', color: '#FF69B4', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold">
            System Wallet
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              sx={{ 
                bgcolor: '#FF69B4', 
                '&:hover': { bgcolor: '#FF1493' },
                borderRadius: 2,
                boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Highlighted Total Balance Card */}
        <Box sx={{ mb: 4 }}>
          <HighlightedCard>
            <CardContent sx={{ p: 4, bgcolor: '#FF69B4' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                    TOTAL BALANCE
                  </Typography>
                  {loading ? (
                    <Typography variant="h2" fontWeight="bold" sx={{ color: '#ffffff', mb: 2 }}>
                      Loading...
                    </Typography>
                  ) : (
                    <Typography variant="h2" fontWeight="bold" sx={{ color: '#ffffff', mb: 2 }}>
                      {totalBalance.toLocaleString()} VND
                    </Typography>
                  )}
                </Box>
                <WhiteIconWrapper>
                  <Wallet fontSize="large" />
                </WhiteIconWrapper>
              </Box>
            </CardContent>
          </HighlightedCard>
        </Box>

        {/* Stats cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <StatsCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {stat.value}
                      </Typography>
                    </Box>
                    <IconWrapper color={stat.color}>
                      {stat.icon}
                    </IconWrapper>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: stat.positive ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {stat.change}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      vs last month
                    </Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>
          ))}
        </Grid>

        {/* Tabs and Tables */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Transactions" />
              <Tab label="Refunds" />
            </Tabs>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Income Wallet ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.incomeWalletID}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {row.incomeWalletID}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {row.incomePrice.toLocaleString()} VND
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(row.createAt).toLocaleDateString()}</Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip label={row.status} size="small"
                        sx={{ 
                            bgcolor: row.status === 'Successfull' ? alpha('#4caf50', 0.1) : alpha('#ff9800', 0.1),
                            color: row.status === 'Successfull' ? 'success.main' : 'warning.main',
                            fontWeight: 'medium',
                            borderRadius: 1,
                          }}
                          />
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={5} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={currentData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
          />
        </Paper>
      </Box>
    </Container>
  );
}