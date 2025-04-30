import React, { useState, useEffect } from 'react';
import { Chip } from '@mui/material';

import axios from 'axios';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  Paper, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, customerId: null });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [updateCustomer, setUpdateCustomer] = useState({
    city: '',
    district: '',
    address: '',
    phone: '',
    birthday: '',
    status: '',
    avatar: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        'https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/customers'
      );
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setSnackbar({ open: true, message: 'Error fetching customers', severity: 'error' });
    }
  };

  const handleOpenUpdateDialog = (customer) => {
    setSelectedCustomer(customer);
    setUpdateCustomer({
      city: customer.city || '',
      district: customer.district || '',
      address: customer.address || '',
      phone: customer.phone || '',
      birthday: customer.birthday ? customer.birthday.split('T')[0] : '',
      status: customer.status || '',
      avatar: customer.avatar || ''
    });
    setOpenUpdateDialog(true);
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setSelectedCustomer(null);
    setUpdateCustomer({
      city: '',
      district: '',
      address: '',
      phone: '',
      birthday: '',
      status: '',
      avatar: ''
    });
  };

  const handleUpdateCustomer = async () => {
    try {
      await axios.put(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/customers/${selectedCustomer.customerId}`,
        updateCustomer
      );
      
      setSnackbar({ open: true, message: 'Customer updated successfully', severity: 'success' });
      handleCloseUpdateDialog();
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      setSnackbar({ open: true, message: 'Error updating customer', severity: 'error' });
    }
  };

  const handleConfirmDelete = (id) => {
    setConfirmDelete({ open: true, customerId: id });
  };

  const handleDeleteCustomer = async () => {
    try {
      await axios.delete(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/customers/delete-customer?id=${confirmDelete.customerId}`
      );
      setCustomers(customers.filter((customer) => customer.customerId !== confirmDelete.customerId));
      setSnackbar({ open: true, message: 'Customer deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting customer', severity: 'error' });
      console.error('Error deleting customer:', error);
    }
    setConfirmDelete({ open: false, customerId: null });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Customer Management</h2>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* <TableCell>ID</TableCell> */}
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customerId}>
                {/* <TableCell>{customer.customerId}</TableCell> */}
                <TableCell>{customer.customerId}</TableCell>

                <TableCell>{customer.email}</TableCell>

                <TableCell>
                  <Chip 
                    label={customer.status ? 'Active' : 'Inactive'}
                    color={customer.status ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>

                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openUpdateDialog} onClose={handleCloseUpdateDialog}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Update Customer</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="City"
            fullWidth
            value={updateCustomer.city}
            onChange={(e) => setUpdateCustomer({ ...updateCustomer, city: e.target.value })}
          />
          <TextField
            margin="dense"
            label="District"
            fullWidth
            value={updateCustomer.district}
            onChange={(e) => setUpdateCustomer({ ...updateCustomer, district: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            value={updateCustomer.address}
            onChange={(e) => setUpdateCustomer({ ...updateCustomer, address: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            value={updateCustomer.phone}
            onChange={(e) => setUpdateCustomer({ ...updateCustomer, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Birthday"
            type="date"
            fullWidth
            value={updateCustomer.birthday}
            onChange={(e) => setUpdateCustomer({ ...updateCustomer, birthday: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="Status"
            fullWidth
            value={updateCustomer.status}
            onChange={(e) => setUpdateCustomer({ ...updateCustomer, status: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Avatar"
            fullWidth
            value={updateCustomer.avatar}
            onChange={(e) => setUpdateCustomer({ ...updateCustomer, avatar: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: 'darkred',} }} onClick={handleCloseUpdateDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateCustomer}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, customerId: null })}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Confirm Customer Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this customer?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, customerId: null })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteCustomer}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerManagement;