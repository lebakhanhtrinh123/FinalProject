import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';

const RefundManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState({}); // Track selected status for each withdrawal

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/WithdrawMoney/GetWithDrawMoney');
        setWithdrawals(response.data.data);
      } catch (error) {
        console.error('Error fetching withdrawal data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Successfull':
        return 'green'; // Green for successful
      case 'Failure':
        return 'red'; // Red for failure
      case 'Request refund':
        return 'pink'; // Pink for request refund
      default:
        return 'black'; // Default color
    }
  };

  const handleUpdateStatus = async (withdrawalId) => {
    const status = selectedStatus[withdrawalId];
    if (!status) return; // No status selected

    try {
      await axios.put(`https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/WithdrawMoney/UpdateWithdrawMoneyId?WithdrawMoneyId=${withdrawalId}&status=${status}`);
      // Optionally, refresh the withdrawals after updating
      const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/WithdrawMoney/GetWithDrawMoney');
      setWithdrawals(response.data.data);
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Refund Management</h2>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Withdraw ID</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Bank Account Name</TableCell>
                <TableCell>Bank Name</TableCell>
                <TableCell>Bank Number</TableCell>
                <TableCell>Wallet ID</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Update Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.withdrawMoneyId}>
                  <TableCell>{withdrawal.withdrawMoneyId}</TableCell>
                  <TableCell>{withdrawal.price}</TableCell>
                  <TableCell>{withdrawal.bankAccountName}</TableCell>
                  <TableCell>{withdrawal.bankName}</TableCell>
                  <TableCell>{withdrawal.bankNumber}</TableCell>
                  <TableCell>{withdrawal.walletId}</TableCell>
                  <TableCell>{withdrawal.reason}</TableCell>
                  <TableCell style={{ color: getStatusColor(withdrawal.status) }}>
                    {withdrawal.status}
                  </TableCell>
                  <TableCell>
                    {withdrawal.status !== 'Successfull' && withdrawal.status !== 'Failure' && (
                      <>
                        <Select
                          value={selectedStatus[withdrawal.withdrawMoneyId] || ''}
                          onChange={(e) => setSelectedStatus({ ...selectedStatus, [withdrawal.withdrawMoneyId]: e.target.value })}
                        >
                          <MenuItem value="">Select Status</MenuItem>
                          <MenuItem value="Successfull">Successfull</MenuItem>
                          <MenuItem value="Failure">Failure</MenuItem>
                        </Select>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleUpdateStatus(withdrawal.withdrawMoneyId)}
                          sx={{ ml: 1 }}
                        >
                          Update Status
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default RefundManagement;
