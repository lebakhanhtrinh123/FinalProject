import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Card, CardContent, CardHeader, IconButton, Typography, Dialog, DialogContent, DialogTitle, DialogActions, Snackbar, Alert, } from '@mui/material';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableHead, TableRow, Box, Avatar, Grid, Paper, Chip, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import EarningCard from 'views/dashboard/EarningCard';
import TotalOrderLineChartCard from 'views/dashboard/TotalOrderLineChartCard';
import TotalGrowthBarChart from 'views/dashboard/TotalGrowthBarChart';
import { Add, Delete, Edit } from '@mui/icons-material';
import Visibility from '@mui/icons-material/Visibility';
import Divider from '@mui/material/Divider';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MainCard from 'ui-component/cards/MainCard';

const API_BASE_URL = 'https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Store';

const StoreOverview = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editStore, setEditStore] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, storeId: null, employeeId: null });
  const [employees, setEmployees] = useState([]);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newStore, setNewStore] = useState({
    storeName: '',
    city: '',
    district: '',
    address: '',
    storePhone: '',
    storeAvatar: '',
    storeEmail: '',
    status: true,
  });
  const [openAddManagerDialog, setOpenAddManagerDialog] = useState(false);
  const [newManager, setNewManager] = useState({
    Password: '',
    FullName: '',
    Address: '',
    Email: '',
    Gender: true,
    Phone: '',
    Birthday: '',
    Status: true,
    Avatar: null
  });
  const [avatarFile, setAvatarFile] = useState(null);

  const PHONE_REGEX = /^(0|\+84)([0-9]{9,10})$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  const fetchStores = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/GetAllStore`);
      setStores(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedStore(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };


  useEffect(() => {
    fetchStores();
  }, []);



  const fetchEmployees = async () => {
    if (!selectedStore?.storeId) return;

    try {
      const response = await axios.get(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/employees/AllEmployeeWithStoreId?StoreId=${selectedStore.storeId}`
      );

      if (response.data && response.data.data) {
        setEmployees(response.data.data);  // Lưu vào state employees thay vì selectedStore
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedStore]);

  const handleViewDetail = (employee) => {
    console.log("Selected Employee:", employee);
    setSelectedEmployee(employee);
    setOpenDetailDialog(true);
    console.log("Dialog State:", openDetailDialog);  // Kiểm tra state
  };

  const validateForm = () => {
    const errors = {};

    Object.keys(newStore).forEach(key => {
      if (key !== 'status' && !newStore[key].trim()) {
        errors[key] = 'This field is required';
      }
    });

    if (newStore.storePhone && !PHONE_REGEX.test(newStore.storePhone)) {
      errors.storePhone = 'Invalid phone number format. Use +84 or 0 followed by 9-10 digits';
    }

    if (newStore.storeEmail && !EMAIL_REGEX.test(newStore.storeEmail)) {
      errors.storeEmail = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = () => {
    const errors = {};

    if (editStore.storePhone && !PHONE_REGEX.test(editStore.storePhone)) {
      errors.storePhone = 'Invalid phone number format. Use +84 or 0 followed by 9-10 digits';
    }

    if (editStore.storeEmail && !EMAIL_REGEX.test(editStore.storeEmail)) {
      errors.storeEmail = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStore = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/CreateStore`,
        newStore, {
        headers: {
          'Content-Type': 'application/json',
        },
      }
      );

      if (response.status === 200) {
        fetchStores();
        setIsDialogOpen(false);
        resetForm();
        setSnackbar({
          open: true,
          message: 'Store added successfully!',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to add store!',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error adding store:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while adding the store.',
        severity: 'error',
      });
    }
  };

  const resetForm = () => {
    setNewStore({
      storeName: '',
      city: '',
      district: '',
      address: '',
      storePhone: '',
      storeAvatar: '',
      storeEmail: '',
      status: true,
    });
    setFormErrors({});
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setNewStore(prev => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleUpdateStore = async () => {
    if (!validateEditForm()) {
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/UpdateStore/${editStore.storeId}`,
        editStore, {
        headers: {
          'Content-Type': 'application/json',
        },
      }
      );

      if (response.status === 200) {
        fetchStores();
        setIsEditDialogOpen(false);
        setSnackbar({
          open: true,
          message: 'Store updated successfully!',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update store!',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating store:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while updating the store.',
        severity: 'error',
      });
    }
  };

  const handleInputChangeForEdit = (field) => (event) => {
    const value = event.target.value;
    setEditStore((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleDeleteStore = async () => {
    if (!confirmDelete.storeId) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/DeleteStore/${confirmDelete.storeId}`
      );

      if (response.status === 200) {
        const updatedStores = stores.filter((store) => store.storeId !== confirmDelete.storeId);
        setStores(updatedStores);

        if (updatedStores.length > 0) {
          setSelectedStore(updatedStores[0]);
        } else {
          setSelectedStore(null);
        }
        setSnackbar({
          open: true,
          message: 'Store deleted successfully!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to delete store!',
          severity: 'error'
        });
      }
      setConfirmDelete({ open: false, storeId: null });
    } catch (error) {
      console.error('Error deleting store:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting the store.',
        severity: 'error'
      });
      setConfirmDelete({ open: false, storeId: null });
    }
  };

  const handleAddManager = () => {
    setOpenAddManagerDialog(true);
  };

  const handleCreateManager = async () => {
    if (!selectedStore?.storeId) {
      setSnackbar({
        open: true,
        message: 'Please select a store first',
        severity: 'error',
      });
      return;
    }

    try {
      // Tạo FormData object
      const formData = new FormData();
      formData.append('FullName', newManager.FullName);
      formData.append('Email', newManager.Email);
      formData.append('Password', newManager.Password);
      formData.append('Phone', newManager.Phone);
      formData.append('Address', newManager.Address);
      formData.append('Birthday', newManager.Birthday);
      formData.append('Gender', newManager.Gender);
      formData.append('Status', true);
      formData.append('Avatar', avatarFile);

      console.log('Selected Store ID:', selectedStore.storeId);
      console.log('Form Data:', Object.fromEntries(formData));

      const response = await axios.post(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/employees/CreateManagerStore?storeid=${selectedStore.storeId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Store Manager added successfully!',
          severity: 'success',
        });
        setOpenAddManagerDialog(false);
        fetchEmployees();
        // Reset form
        setNewManager({
          Password: '',
          FullName: '',
          Address: '',
          Email: '',
          Gender: true,
          Phone: '',
          Birthday: '',
          Status: true,
          Avatar: null
        });
        setAvatarFile(null);
      }
    } catch (error) {
      console.error('Error creating manager:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add Store Manager',
        severity: 'error',
      });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'your_cloudinary_upload_preset');

      try {
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
          formData
        );
        setNewManager({ ...newManager, Avatar: response.data.secure_url });
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const response = await axios.delete(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/employees/delete-employee?id=${employeeId}`
      );

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Employee deleted successfully!',
          severity: 'success'
        });
        fetchEmployees(); // Refresh danh sách
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete employee',
        severity: 'error'
      });
    } finally {
      setConfirmDelete({ open: false, employeeId: null });
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <FormControl fullWidth sx={{ flex: 1 }}>
          <InputLabel>Select a store</InputLabel>
          <Select
            value={selectedStore ? selectedStore.storeId : ''}
            onChange={(e) => setSelectedStore(stores.find(store => store.storeId === e.target.value))}
            label="Select a store"
          >
            {stores.map((store) => (
              <MenuItem key={store.storeId} value={store.storeId}>
                {store.storeName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<Add />}
          color="primary"
          onClick={() => setIsDialogOpen(true)}
          size="large"
          sx={{ marginLeft: '16px', padding: '8px 16px', flex: 0.1 }}
        >
          Add Store
        </Button>
      </Box>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <EarningCard
            revenue={selectedStore ? selectedStore.revenue : 0}
            expenses={selectedStore ? selectedStore.expenses : 0}
            profit={selectedStore ? selectedStore.profit : 0}
            isLoading={false}
          />
          <TotalOrderLineChartCard isLoading={false} storeId={selectedStore?.storeId} />
        </div>

        {selectedStore && (
          <Card sx={{ boxShadow: 3, borderRadius: '16px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      flex: 2,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    Store Information
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setEditStore(selectedStore);
                        setIsEditDialogOpen(true);
                      }}
                      sx={{ width: '50%' }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setConfirmDelete({
                        open: true,
                        storeId: selectedStore.storeId
                      })}
                      sx={{ width: '50%' }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              }
              sx={{
                backgroundColor: '#ffffff',
                color: 'white',
                padding: '16px',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            />
            <Divider />
            <CardContent sx={{ padding: '24px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', flex: 1 }}>Store Name:</Typography>
                  <Typography variant="body1" sx={{ fontSize: '1rem', color: '#333' }}>{selectedStore.storeName}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', flex: 1 }}>Address:</Typography>
                  <Typography variant="body1" sx={{ fontSize: '1rem', color: '#333' }}>{selectedStore.address}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', flex: 1 }}>City:</Typography>
                  <Typography variant="body1" sx={{ fontSize: '1rem', color: '#333' }}>{selectedStore.city}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', flex: 1 }}>District:</Typography>
                  <Typography variant="body1" sx={{ fontSize: '1rem', color: '#333' }}>{selectedStore.district}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', flex: 1 }}>Phone:</Typography>
                  <Typography variant="body1" sx={{ fontSize: '1rem', color: '#333' }}>{selectedStore.storePhone}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', flex: 1 }}>Store Email:</Typography>
                  <Typography variant="body1" sx={{ fontSize: '1rem', color: '#333' }}>{selectedStore.storeEmail}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedStore ? (
        <TotalGrowthBarChart
          isLoading={false}
          storeId={selectedStore.storeId}
        />
      ) : (
        <Box sx={{ mt: 2 }}>
          <MainCard>
            <Typography variant="body1" color="textSecondary" align="center">
              Please select a store to view revenue data
            </Typography>
          </MainCard>
        </Box>
      )}

      <Card sx={{ boxShadow: 3 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Employees</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                color="primary"
                onClick={handleAddManager}
              >
                Add Store Manager
              </Button>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{
              minWidth: 800,
              whiteSpace: 'nowrap'
            }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Avatar</TableCell>
                  <TableCell>FullName</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Birthday</TableCell>
                  <TableCell>RoleName</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.employeeId}</TableCell>

                    <TableCell>

                      {employee.avatar && (
                        <img
                          src={employee.avatar}
                          alt={employee.fullName}
                          style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{employee.fullName}</TableCell>
                    <TableCell>{employee.address}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>{employee.gender ? "Male" : "Female"}</TableCell>
                    <TableCell>{new Date(employee.birthday).toLocaleDateString()}</TableCell>
                    <TableCell>{employee.roleName}</TableCell>
                    <TableCell>{employee.status ? "Active" : "Inactive"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="info"
                        onClick={() => handleViewDetail(employee)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setConfirmDelete({ open: true, employeeId: employee.employeeId })}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        sx={{ '& .MuiDialog-paper': { width: '500px', padding: '24px' } }}
      >
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Add New Store</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Store Name"
              value={newStore.storeName}
              onChange={handleInputChange('storeName')}
              fullWidth
              required
              error={!!formErrors.storeName}
              helperText={formErrors.storeName}
            />
            <TextField
              label="City"
              value={newStore.city}
              onChange={handleInputChange('city')}
              fullWidth
              required
              error={!!formErrors.city}
              helperText={formErrors.city}
            />
            <TextField
              label="District"
              value={newStore.district}
              onChange={handleInputChange('district')}
              fullWidth
              required
              error={!!formErrors.district}
              helperText={formErrors.district}
            />
            <TextField
              label="Address"
              value={newStore.address}
              onChange={handleInputChange('address')}
              fullWidth
              required
              error={!!formErrors.address}
              helperText={formErrors.address}
            />
            <TextField
              label="Phone"
              value={newStore.storePhone}
              onChange={handleInputChange('storePhone')}
              fullWidth
              required
              error={!!formErrors.storePhone}
              helperText={formErrors.storePhone || 'Format: 0xxxxxxxxx or +84xxxxxxxxx'}
            />
            <TextField
              label="Email"
              value={newStore.storeEmail}
              onChange={handleInputChange('storeEmail')}
              fullWidth
              required
              error={!!formErrors.storeEmail}
              helperText={formErrors.storeEmail}
            />
            <TextField
              label="Avatar URL"
              value={newStore.storeAvatar}
              onChange={handleInputChange('storeAvatar')}
              fullWidth
              required
              error={!!formErrors.storeAvatar}
              helperText={formErrors.storeAvatar}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="error">Cancel</Button>
          <Button onClick={handleAddStore} color="success">Add Store</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        sx={{ '& .MuiDialog-paper': { width: '500px', padding: '24px' } }}
      >
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Edit Store</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Store Name"
              value={editStore?.storeName || ''}
              onChange={handleInputChangeForEdit('storeName')}
              fullWidth
              error={!!formErrors.storeName}
              helperText={formErrors.storeName}
            />
            <TextField
              label="City"
              value={editStore?.city || ''}
              onChange={handleInputChangeForEdit('city')}
              fullWidth
              error={!!formErrors.city}
              helperText={formErrors.city}
            />
            <TextField
              label="District"
              value={editStore?.district || ''}
              onChange={handleInputChangeForEdit('district')}
              fullWidth
              error={!!formErrors.district}
              helperText={formErrors.district}
            />
            <TextField
              label="Address"
              value={editStore?.address || ''}
              onChange={handleInputChangeForEdit('address')}
              fullWidth
              error={!!formErrors.address}
              helperText={formErrors.address}
            />
            <TextField
              label="Phone"
              value={editStore?.storePhone || ''}
              onChange={handleInputChangeForEdit('storePhone')}
              fullWidth
              error={!!formErrors.storePhone}
              helperText={formErrors.storePhone || 'Format: 0xxxxxxxxx or +84xxxxxxxxx'}
            />
            <TextField
              label="Email"
              value={editStore?.storeEmail || ''}
              onChange={handleInputChangeForEdit('storeEmail')}
              fullWidth
              error={!!formErrors.storeEmail}
              helperText={formErrors.storeEmail}
            />
            <TextField
              label="Avatar URL"
              value={editStore?.storeAvatar || ''}
              onChange={handleInputChangeForEdit('storeAvatar')}
              fullWidth
              error={!!formErrors.storeAvatar}
              helperText={formErrors.storeAvatar}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} color="error">Cancel</Button>
          <Button onClick={handleUpdateStore} color="success">Update Store</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, storeId: null, employeeId: null })}
      >
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Confirm Store Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the store: <strong>{selectedStore?.storeName}</strong>?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDelete({ open: false, storeId: null, employeeId: null })}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteStore}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            padding: '20px'
          }
        }}
      >
        <DialogTitle sx={{
          fontSize: '18px',
          fontWeight: 'bold',
          pb: 2,
          pt: 0,
          px: 0
        }}>
          Employee Details
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedEmployee ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar
                  src={selectedEmployee.avatar}
                  alt={selectedEmployee.fullName}
                  sx={{ width: 120, height: 120 }}
                />
              </Box>
              <TextField
                label="Full Name"
                value={selectedEmployee.fullName}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Email"
                value={selectedEmployee.email}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Phone"
                value={selectedEmployee.phone}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Address"
                value={selectedEmployee.address}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Birthday"
                value={new Date(selectedEmployee.birthday).toLocaleDateString()}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Gender"
                value={selectedEmployee.gender ? "Male" : "Female"}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Role"
                value={selectedEmployee.roleName}
                fullWidth
                InputProps={{ readOnly: true }}
              />

              <TextField
                label="Status"
                value={selectedEmployee.status ? "Active" : "Inactive"}
                fullWidth
                InputProps={{ readOnly: true }}
              />

              <TextField
                label="Identification Number"
                value={selectedEmployee.identificationNumber}
                fullWidth
                InputProps={{ readOnly: true }}
              />

              <Typography variant="subtitle1">Identification Back Of Photo:</Typography>
              <Box sx={{ width: '100%', height: 200, position: 'relative' }}>
                <img
                  src={selectedEmployee.identificationBackOfPhoto}
                  alt="ID Back"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
              </Box>

              <Typography variant="subtitle1">Identification Front Of Photo:</Typography>
              <Box sx={{ width: '100%', height: 200, position: 'relative' }}>
                <img
                  src={selectedEmployee.identificationFontOfPhoto}
                  alt="ID Front"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
              </Box>


            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 0, pb: 0, pt: 2 }}>
          <Button
            onClick={() => setOpenDetailDialog(false)}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              px: 3
            }}
          >
            Cancel
          </Button>

        </DialogActions>
      </Dialog>

      <Dialog
        open={openAddManagerDialog}
        onClose={() => setOpenAddManagerDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            padding: '20px'
          }
        }}
      >
        <DialogTitle sx={{
          fontSize: '18px',
          fontWeight: 'bold',
          pb: 2,
          pt: 0,
          px: 0
        }}>
          Add New Store Manager
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Full Name"
              placeholder="Enter full name"
              value={newManager.FullName || ''}
              onChange={(e) => {
                console.log('Setting FullName:', e.target.value);
                setNewManager({ ...newManager, FullName: e.target.value });
              }}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Email"
              placeholder="Enter email"
              value={newManager.Email || ''}
              onChange={(e) => {
                console.log('Setting Email:', e.target.value);
                setNewManager({ ...newManager, Email: e.target.value });
              }}
              fullWidth
              required
              type="email"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Password"
              placeholder="Enter password"
              value={newManager.Password || ''}
              onChange={(e) => {
                console.log('Setting Password:', e.target.value);
                setNewManager({ ...newManager, Password: e.target.value });
              }}
              fullWidth
              required
              type="password"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Phone"
              placeholder="Enter phone number"
              value={newManager.Phone || ''}
              onChange={(e) => {
                console.log('Setting Phone:', e.target.value);
                setNewManager({ ...newManager, Phone: e.target.value });
              }}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Address"
              placeholder="Enter address"
              value={newManager.Address || ''}
              onChange={(e) => {
                console.log('Setting Address:', e.target.value);
                setNewManager({ ...newManager, Address: e.target.value });
              }}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Birthday"
              type="date"
              value={newManager.Birthday || ''}
              onChange={(e) => {
                console.log('Setting Birthday:', e.target.value);
                setNewManager({ ...newManager, Birthday: e.target.value });
              }}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl fullWidth>
              <InputLabel id="gender-label" shrink>Gender</InputLabel>
              <Select
                labelId="gender-label"
                value={newManager.Gender}
                onChange={(e) => {
                  console.log('Setting Gender:', e.target.value);
                  setNewManager({ ...newManager, Gender: e.target.value });
                }}
                label="Gender"
              >
                <MenuItem value={true}>Male</MenuItem>
                <MenuItem value={false}>Female</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ mb: 1 }}>
                Avatar Image
              </Typography>
              <input
                accept="image/*"
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setAvatarFile(file);
                    setNewManager({ ...newManager, Avatar: URL.createObjectURL(file) });
                  }
                }}
                style={{ display: 'none' }}
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Avatar
                </Button>
              </label>
              {newManager.Avatar && (
                <Box sx={{ mt: 1 }}>
                  <img
                    src={newManager.Avatar}
                    alt="Avatar preview"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 0, pb: 0, pt: 2 }}>
          <Button
            onClick={() => setOpenAddManagerDialog(false)}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none' }}
            onClick={handleCreateManager}
          >
            Add Manager
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, employeeId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this employee?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDelete({ open: false, employeeId: null })}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteEmployee(confirmDelete.employeeId)}
            color="error"
            variant="contained"
          >
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
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    {icon}
    <Box>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body1">
        {value}
      </Typography>
    </Box>
  </Box>
);

export default StoreOverview;