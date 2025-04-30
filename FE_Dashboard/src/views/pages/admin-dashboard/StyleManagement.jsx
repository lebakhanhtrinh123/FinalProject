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

const StyleManagement = () => {
  const [styles, setstyles] = useState([]);
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
  const [categories, setCategories] = useState([]);

  // Fetch styles
  const fetchFlowerBaskets = async () => {
    try {
      const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/style/GetAllStyle');
      console.log('API Response:', response.data);
      console.log('Response type:', typeof response.data);
      console.log('Is Array?', Array.isArray(response.data));
      
      if (response.data && Array.isArray(response.data)) {
        setstyles(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setstyles(response.data.data);
      } else {
        setstyles([]); // Set empty array if no valid data
        console.warn('Received unexpected data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching styles:', error);
      setstyles([]); // Set empty array on error
      setSnackbar({
        open: true,
        message: 'Failed to fetch styles',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchFlowerBaskets();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/categories/GetCategoryByStyleType');
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
        description: basket.description,
        image: basket.image,
        status: basket.status,
        categoryId: basket.categoryId || '',
        feature: basket.feature || false
      });
    } else {
      setEditingBasket(null);
      setNewBasket({
        name: '',
        note: '',
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
      setNewBasket({ ...newBasket, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (basket) => {
    console.log('Editing basket:', basket);
    setEditingBasket(basket);
    setNewBasket({
      name: basket.name || '',
      note: basket.note || '',
      description: basket.description || '',
      image: null,
      status: basket.status !== undefined ? basket.status : true,
      categoryId: basket.categoryId || '',
      feature: basket.feature || false
    });
    setImagePreview(basket.image); // Hiển thị ảnh hiện tại
    setOpenDialog(true);
  };

  const handleAddBasket = async () => {
    try {
      if (!newBasket.name || !newBasket.image || !newBasket.categoryId) {
        setSnackbar({
          open: true,
          message: 'Name, Image and Category are required',
          severity: 'error'
        });
        return;
      }

      const formData = new FormData();
      
      formData.append('Name', String(newBasket.name).trim());
      formData.append('Note', String(newBasket.note || '').trim());
      formData.append('Description', String(newBasket.description || '').trim());
      formData.append('Status', String(Boolean(newBasket.status)));
      formData.append('CategoryId', String(newBasket.categoryId));
      formData.append('Feature', String(Boolean(newBasket.feature)));
      
      if (newBasket.image instanceof File) {
        formData.append('Image', newBasket.image);
      } else {
        throw new Error('Please select an image');
      }

      console.log('Form data being sent:', {
        Name: newBasket.name,
        Note: newBasket.note,
        Description: newBasket.description,
        Status: newBasket.status,
        CategoryId: newBasket.categoryId,
        Feature: newBasket.feature,
        hasImage: newBasket.image instanceof File
      });

      const response = await axios.post(
        'https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/style/CreateStyle',
        formData,
        {
          headers: {
            'accept': '*/*',
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('API Response:', response);

      // Check if response exists and has data
      if (response && response.data) {
        // Check if response indicates success
        if (response.data.resultStatus === "Success" || response.status === 200) {
          setSnackbar({
            open: true,
            message: 'Style created successfully!',
            severity: 'success'
          });
          setOpenDialog(false);
          // Reset form
          setNewBasket({
            name: '',
            note: '',
            description: '',
            image: null,
            status: true,
            categoryId: ''
          });
          setImagePreview(null);
          await fetchFlowerBaskets(); // Fetch updated data
          return;
        }
      }
      
      // If we get here, something went wrong
      throw new Error(response?.data?.messages?.[0] || 'Failed to create style');

    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        stack: error.stack
      });

      // Only show error message if it's actually an error
      if (!error.response || error.response.status !== 200) {
        setSnackbar({
          open: true,
          message: error.response?.data?.messages?.[0] || error.message || 'Failed to create style',
          severity: 'error'
        });
      }
    }
  };

  const handleUpdateBasket = async () => {
    try {
      if (!newBasket.name || !newBasket.categoryId) {
        setSnackbar({
          open: true,
          message: 'Name and Category are required',
          severity: 'error'
        });
        return;
      }

      console.log('Updating style:', editingBasket.styleId);
      
      const formData = new FormData();
      
      formData.append('Name', String(newBasket.name).trim());
      formData.append('Note', String(newBasket.note || '').trim());
      formData.append('Description', String(newBasket.description || '').trim());
      formData.append('Status', String(Boolean(newBasket.status)));
      formData.append('CategoryId', String(newBasket.categoryId));
      formData.append('Feature', String(Boolean(newBasket.feature)));
      
      // Chỉ thêm ảnh vào FormData nếu người dùng chọn ảnh mới
      if (newBasket.image instanceof File) {
        formData.append('Image', newBasket.image);
      }

      console.log('Update request details:', {
        url: `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/style/UpdateStyle/${editingBasket.styleId}`,
        formData: Object.fromEntries(formData.entries()),
        hasNewImage: newBasket.image instanceof File
      });

      const response = await axios.put(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/style/UpdateStyle/${editingBasket.styleId}`,
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
          message: 'Style updated successfully!',
          severity: 'success'
        });
        setOpenDialog(false);
        setEditingBasket(null);
        setNewBasket({
          name: '',
          note: '',
          description: '',
          image: null,
          status: true,
          categoryId: ''
        });
        setImagePreview(null);
        await fetchFlowerBaskets();
      } else {
        throw new Error(response.data?.messages?.[0] || 'Failed to update style');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        stack: error.stack,
        styleId: editingBasket?.styleId
      });
      
      setSnackbar({
        open: true,
        message: error.response?.data?.messages?.[0] || error.message || 'Failed to update style',
        severity: 'error'
      });
    }
  };

  const handleConfirmDelete = (id) => {
    setConfirmDelete({ open: true, basketId: id });
  };

  const handleDelete = async (basketId) => {
    try {
      console.log('Deleting style with ID:', basketId);
      
      const response = await axios.delete(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/style/DeleteStyle?id=${basketId}`
      );

      console.log('Delete response:', response);

      // Check if response exists and has data
      if (response && response.data) {
        // Check if response indicates success
        if (response.data.resultStatus === "Success" || response.status === 200) {
          setSnackbar({
            open: true,
            message: 'Style deleted successfully!',
            severity: 'success'
          });
          // Refresh data sau khi xóa
          await fetchFlowerBaskets();
        } else {
          throw new Error(response.data.messages?.[0] || 'Failed to delete style');
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
        message: error.response?.data?.messages?.[0] || error.message || 'Failed to delete style',
        severity: 'error'
      });
    } finally {
      // Đóng confirm dialog
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
    
    if (newBasket.status === null) {
      errors.push('Status is required');
    }

    return errors;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Style Management</h2>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setOpenDialog(true)}
          aria-label="open add style form"
        >
          Add Style
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
              <TableCell>Description</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {styles.map((style) => (

              <TableRow key={style.styleId}>
                                              <TableCell>{style.styleId}</TableCell>

                <TableCell>
                  {style.image && (
                    <img
                      src={style.image}
                      alt={style.name}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    />
                  )}
                </TableCell>
                <TableCell>{style.name}</TableCell>
                <TableCell>{style.categoryName}</TableCell>
                <TableCell>{style.note}</TableCell>
                <TableCell>{style.description}</TableCell>
                <TableCell>
                  <Chip 
                    label={style.feature ? 'Yes' : 'No'}
                    color={style.feature ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={style.status ? 'Active' : 'Inactive'}
                    color={style.status ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    color="info" 
                    onClick={() => setViewDetail({ open: true, basket: style })}
                    title="View Detail"
                  >
                    <RemoveRedEye />
                  </IconButton>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleEdit(style)}
                    title="Edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => setConfirmDelete({ 
                      open: true, 
                      basketId: style.styleId,
                      basketName: style.name 
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
            description: '',
            image: null,
            status: true,
            categoryId: ''
          });
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingBasket ? `Edit Style: ${editingBasket.name}` : 'Add New Style'}
        </DialogTitle>
        <DialogContent>
          <Box 
            component="form" 
            sx={{ mt: 2 }} 
            noValidate
            role="form"
            aria-label="style form"
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
                  label="Note"
                  value={newBasket.note}
                  onChange={(e) => setNewBasket({ ...newBasket, note: e.target.value })}
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
              <Grid item xs={12} sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
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
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUpload />}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
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
                description: '',
                image: null,
                status: true,
                categoryId: ''
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
            Are you sure you want to delete style "{confirmDelete.basketName}"?
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
          <Typography variant="h6">Style Details</Typography>
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
                      ID: {viewDetail.basket.styleId}
                    </Typography>
                  </Box>

                  {/* Detailed Information */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Note</TableCell>
                          <TableCell>{viewDetail.basket.note || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell>{viewDetail.basket.description || 'N/A'}</TableCell>
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
                          <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                          <TableCell>
                            {viewDetail.basket.createAt ? 
                              new Date(viewDetail.basket.createAt).toLocaleString() : 
                              'N/A'
                            }
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
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Category</TableCell>
                          <TableCell>{viewDetail.basket.categoryName || 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
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

export default StyleManagement;