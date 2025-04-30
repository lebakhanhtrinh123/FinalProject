import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Grid,
  FormControlLabel,
  Switch,
  Typography
} from '@mui/material';
import { Delete, Edit, Add, RemoveRedEye } from '@mui/icons-material';
import { Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CloudUpload } from '@mui/icons-material';

const AccessoryManagement = () => {
  const [accessories, setAccessories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingBasket, setEditingBasket] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    basketId: null,
    basketName: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [newBasket, setNewBasket] = useState({
    name: '',
    note: '',
    price: 0,
    description: '',
    image: null,
    status: true,
    categoryId: '',
    feature: false
  });
  const [viewDetail, setViewDetail] = useState({
    open: false,
    basket: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch accessories
  const fetchAccessories = async () => {
    try {
      const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/accessory/GetAllAccessory');
      if (response.data && response.data.data) {
        setAccessories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching accessories:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch accessories',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/categories/GetCategoryByAccessoryType');
        console.log('Categories fetched:', response.data);
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleOpenDialog = (basket = null) => {
    if (basket) {
      setEditingBasket(basket);
      setNewBasket({
        name: basket.name,
        note: basket.note,
        price: basket.price,
        description: basket.description,
        image: basket.image,
        status: basket.status,
        categoryId: basket.categoryId,
        feature: basket.feature
      });
    } else {
      setEditingBasket(null);
      setNewBasket({
        name: '',
        note: '',
        price: 0,
        description: '',
        image: null,
        status: true,
        categoryId: '',
        feature: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('New image selected:', file); // Thêm log để kiểm tra
      setNewBasket(prev => ({
        ...prev,
        image: file
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditClick = (accessory) => {
    console.log('Edit accessory data:', accessory); // Log để kiểm tra dữ liệu
    setEditingBasket(accessory);
    setNewBasket({
      name: accessory.name || '',
      note: accessory.note || '',
      price: accessory.price || 0,
      description: accessory.description || '',
      status: accessory.status ?? true,
      image: null,
      categoryId: accessory.categoryId || '', // Đảm bảo có giá trị mặc định
      feature: accessory.feature ?? false
    });
    setImagePreview(accessory.image);
    setOpenDialog(true);
  };

  const handleAddBasket = async () => {
    try {
      // Validate required fields
      if (!newBasket.name || !newBasket.image || !newBasket.categoryId) {
        setSnackbar({
          open: true,
          message: 'Name, Image and Category are required',
          severity: 'error'
        });
        return;
      }

      const formData = new FormData();
      
      // Append all fields according to API requirements
      formData.append('Name', String(newBasket.name).trim());
      formData.append('Note', String(newBasket.note || '').trim());
      formData.append('Price', String(Math.max(0, Number(newBasket.price || 0))));
      formData.append('CategoryId', String(newBasket.categoryId));
      formData.append('Description', String(newBasket.description || '').trim());
      formData.append('Status', String(Boolean(newBasket.status)));
      formData.append('Feature', String(Boolean(newBasket.feature)));

      // Handle image
      if (newBasket.image instanceof File) {
        formData.append('Image', newBasket.image);
      } else {
        formData.append('Image', '');
      }

      // Log request data for debugging
      console.log('Creating accessory with data:', {
        Name: newBasket.name,
        Note: newBasket.note,
        Price: newBasket.price,
        CategoryId: newBasket.categoryId,
        Description: newBasket.description,
        Status: newBasket.status,
        Feature: newBasket.feature,
        hasImage: newBasket.image instanceof File
      });

      const response = await axios.post(
        'https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/accessory/CreateAccessory',
        formData,
        {
          headers: {
            'accept': '*/*',
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('API Response:', response);

      if (response.data && (response.data.resultStatus === "Success" || response.status === 200)) {
        setSnackbar({
          open: true,
          message: response.data.messages?.[0] || 'Accessory created successfully!',
          severity: 'success'
        });
        setOpenDialog(false);
        // Reset form
        setNewBasket({
          name: '',
          note: '',
          price: 0,
          description: '',
          image: null,
          status: true,
          categoryId: '',
          feature: false
        });
        setImagePreview(null);
        await fetchAccessories();
      } else {
        throw new Error(response.data?.messages?.[0] || 'Failed to create accessory');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        stack: error.stack
      });

      setSnackbar({
        open: true,
        message: error.response?.data?.messages?.[0] || error.message || 'Failed to create accessory',
        severity: 'error'
      });
    }
  };

  const handleUpdateBasket = async () => {
    try {
      if (!newBasket.name) {
        setSnackbar({
          open: true,
          message: 'Name is required',
          severity: 'error'
        });
        return;
      }

      console.log('Updating accessory:', editingBasket.accessoryId);
      
      const formData = new FormData();
      
      formData.append('Name', String(newBasket.name).trim());
      formData.append('Note', String(newBasket.note || '').trim());
      formData.append('Price', newBasket.price ? Math.max(0, Number(newBasket.price)).toString() : '0');
      formData.append('Description', String(newBasket.description || '').trim());
      formData.append('Status', Boolean(newBasket.status).toString());
      formData.append('Feature', Boolean(newBasket.feature).toString());
      
      // Log trước khi append image
      console.log('Image to upload:', newBasket.image);

      // Xử lý ảnh
      if (newBasket.image instanceof File) {
        console.log('Appending new image to FormData');
        formData.append('Image', newBasket.image);
      } else {
        console.log('No new image, sending empty string');
        formData.append('Image', '');
      }

      // Log FormData để kiểm tra
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await axios.put(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/accessory/UpdateAccessory/${editingBasket.accessoryId}`,
        formData,
        {
          headers: {
            'accept': '*/*',
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Update response:', response);

      if (response.data && (response.data.resultStatus === "Success" || response.status === 200)) {
        setSnackbar({
          open: true,
          message: 'Accessory updated successfully!',
          severity: 'success'
        });
        setOpenDialog(false);
        setEditingBasket(null);
        setNewBasket({
          name: '',
          note: '',
          price: 0,
          description: '',
          image: null,
          status: true,
          categoryId: '',
          feature: false
        });
        setImagePreview(null);
        await fetchAccessories();
      } else {
        throw new Error(response.data?.messages?.[0] || 'Failed to update accessory');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        stack: error.stack,
        accessoryId: editingBasket?.accessoryId
      });
      
      setSnackbar({
        open: true,
        message: error.response?.data?.messages?.[0] || error.message || 'Failed to update accessory',
        severity: 'error'
      });
    }
  };

  const handleConfirmDelete = (id) => {
    setConfirmDelete({ open: true, basketId: id });
  };

  const handleDelete = async (basketId) => {
    try {
      console.log('Deleting accessory with ID:', basketId);
      
      const response = await axios.delete(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/accessory/DeleteAccessory?id=${basketId}`
      );

      console.log('Delete response:', response);

      if (response && response.data) {
        if (response.data.resultStatus === "Success" || response.status === 200) {
        setSnackbar({
          open: true,
            message: 'Accessory deleted successfully!',
          severity: 'success'
        });
          await fetchAccessories();
      } else {
          throw new Error(response.data.messages?.[0] || 'Failed to delete accessory');
        }
      } else {
        throw new Error('No response data received');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        stack: error.stack
      });
      
      setSnackbar({
        open: true,
        message: error.response?.data?.messages?.[0] || error.message || 'Failed to delete accessory',
        severity: 'error'
      });
    } finally {
      setConfirmDelete({ open: false, basketId: null, basketName: '' });
    }
  };

  // Sửa lại hàm validateForm, bỏ validation quantity
  const validateForm = () => {
    const errors = [];
    
    if (!newBasket.name) {
      errors.push('Name is required');
    }
    
    if (!newBasket.image) {
      errors.push('Image is required');
    }
    
    if (newBasket.price <= 0) {
      errors.push('Price must be greater than 0');
    }

    return errors;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Accessory Management</h2>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setOpenDialog(true)}
          aria-label="open add accessory form"
        >
          Add Accessory
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
            <TableCell>ID</TableCell>

              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accessories.map((accessory) => (

              <TableRow key={accessory.accessoryId}>
                                <TableCell>{accessory.accessoryId}</TableCell>

                <TableCell>
                  {accessory.image && (
                    <img
                      src={accessory.image}
                      alt={accessory.name}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    />
                  )}
                </TableCell>
                <TableCell>{accessory.name}</TableCell>
                <TableCell>{accessory.categoryName}</TableCell>

                <TableCell>{accessory.note}</TableCell>
                <TableCell>{accessory.price ? accessory.price.toLocaleString() + ' VND' : 'N/A'}</TableCell>
                <TableCell>{accessory.description}</TableCell>
                <TableCell>
                  <Chip 
                    label={accessory.feature ? 'Yes' : 'No'}
                    color={accessory.feature ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={accessory.status ? 'Active' : 'Inactive'}
                    color={accessory.status ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    color="info" 
                    onClick={() => setViewDetail({ open: true, basket: accessory })}
                    title="View Detail"
                  >
                    <RemoveRedEye />
                  </IconButton>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleEditClick(accessory)}
                    title="Edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => setConfirmDelete({ 
                      open: true, 
                      basketId: accessory.accessoryId,
                      basketName: accessory.name 
                    })}
                    title="Delete"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setEditingBasket(null);
          setNewBasket({
            name: '',
            note: '',
            price: 0,
            description: '',
            image: null,
            status: true,
            categoryId: '',
            feature: false
          });
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingBasket ? `Edit Accessory: ${editingBasket.name}` : 'Add New Accessory'}
        </DialogTitle>
        <DialogContent>
          <Box 
            component="form" 
            sx={{ mt: 2 }} 
            noValidate
            role="form"
            aria-label="accessory form"
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Name"
                  value={newBasket.name}
                  onChange={(e) => setNewBasket({ ...newBasket, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newBasket.categoryId || ''}
                    onChange={(e) => setNewBasket({ ...newBasket, categoryId: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="">
                      <em>Select a category</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Note"
                  value={newBasket.note}
                  onChange={(e) => setNewBasket({ ...newBasket, note: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Price"
                  value={newBasket.price}
                  onChange={(e) => setNewBasket({ ...newBasket, price: parseInt(e.target.value) })}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={newBasket.description}
                  onChange={(e) => setNewBasket({ ...newBasket, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newBasket.status}
                      onChange={(e) => setNewBasket({ ...newBasket, status: e.target.checked })}
                    />
                  }
                  label="Active Status"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={newBasket.feature}
                      onChange={(e) => setNewBasket({ ...newBasket, feature: e.target.checked })}
                    />
                  }
                  label="Featured"
                />
              </Grid>
              <Grid item xs={12}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="image-upload"
                  />
                <label htmlFor="image-upload">
                  <Button variant="contained" component="span">
                    Choose Image
                </Button>
                </label>
                
                {(imagePreview || editingBasket?.image) && (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={
                        imagePreview instanceof File 
                          ? URL.createObjectURL(imagePreview) 
                          : (imagePreview || editingBasket?.image)
                      }
                      alt="Preview"
                      style={{
                        maxWidth: '200px', 
                        maxHeight: '200px',
                        objectFit: 'contain',
                        display: 'block',
                        marginTop: '8px'
                      }}
                    />
                  </div>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setEditingBasket(null);
              setNewBasket({
                name: '',
                note: '',
                price: 0,
                description: '',
                image: null,
                status: true,
                categoryId: '',
                feature: false
              });
            }}
            color="error"
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={editingBasket ? handleUpdateBasket : handleAddBasket}
            disabled={!newBasket.name}
          >
            {editingBasket ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, basketId: null, basketName: '' })}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete accessory "{confirmDelete.basketName}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDelete({ open: false, basketId: null, basketName: '' })}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDelete(confirmDelete.basketId)}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewDetail.open}
        onClose={() => setViewDetail({ open: false, basket: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6">Accessory Details</Typography>
          <IconButton onClick={() => setViewDetail({ open: false, basket: null })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {viewDetail.basket && (
            <Grid container spacing={3}>
              {/* Left side - Image */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  sx={{
                    height: 400,
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {viewDetail.basket.image ? (
                    <img
                      src={viewDetail.basket.image}
                      alt={viewDetail.basket.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Typography color="textSecondary">No image available</Typography>
                  )}
                </Paper>
              </Grid>

              {/* Right side - Information */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Basic Info */}
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {viewDetail.basket.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID: {viewDetail.basket.accessoryId}
                    </Typography>
                  </Box>

                  {/* Price */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" color="primary">
                      {viewDetail.basket.price ? `${viewDetail.basket.price.toLocaleString()} VND` : 'N/A'}
                    </Typography>
                  </Box>

                  {/* Detailed Information */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Category</TableCell>
                          <TableCell>{viewDetail.basket.categoryName || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Note</TableCell>
                          <TableCell>{viewDetail.basket.note || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell>
                            <Chip 
                              label={viewDetail.basket.status ? 'Active' : 'Inactive'}
                              color={viewDetail.basket.status ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Featured</TableCell>
                          <TableCell>
                            <Chip 
                              label={viewDetail.basket.feature ? 'Yes' : 'No'}
                              color={viewDetail.basket.feature ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                          <TableCell>
                            {new Date(viewDetail.basket.createAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Updated At</TableCell>
                          <TableCell>
                            {viewDetail.basket.updateAt ? 
                              new Date(viewDetail.basket.updateAt).toLocaleString() : 
                              'N/A'
                            }
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Description */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#f8f8f8',
                        minHeight: 100
                      }}
                    >
                      <Typography>
                        {viewDetail.basket.description || 'No description available'}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'error' ? 6000 : 3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccessoryManagement;