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
  Typography,
  InputAdornment,
  FormControlLabel,
  Switch,
  FormHelperText,
  Chip,
  CircularProgress
} from '@mui/material';
import { Delete, Edit, Add, CloudUpload, Close as CloseIcon, RemoveRedEye, ChevronLeft, ChevronRight } from '@mui/icons-material';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, customerId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: '',
    price: 0,
    size: '',
    quantity: 0,
    discount: 0,
    description: '',
    featured: false,
    status: true,
    categoryId: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateProductData, setUpdateProductData] = useState({
    productName: '',
    quantity: 0,
    price: 0,
    size: '',
    weight: 0,
    discount: 0,
    description: '',
    featured: true,
    categoryId: '',
    status: true
  });
  const [viewDetail, setViewDetail] = useState({
    open: false,
    product: null
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [productDetail, setProductDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Product/GetAllProduct');
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // useEffect(() => {
  //   const fetchStores = async () => {
  //     try {
  //       const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Store/GetAllStore');
  //       setStores(response.data.data || []);
  //     } catch (error) {
  //       console.error('Error fetching stores:', error);
  //     }
  //   };

  //   fetchStores();
  // }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/categories/getCartegoryByProductType');
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setNewProduct({
        productName: product.productName,
        quantity: product.quantity || 0,
        price: product.price,
        size: product.size,
        weight: product.weight,

        discount: product.discount || 0,
        description: product.description,
        featured: product.featured,
        categoryId: product.categoryId || '',
        status: product.status,
        images: product.productImages?.map(image => image.productImage1) || []
      });
    } else {
      setEditingProduct(null);
      setNewProduct({
        productName: '',
        price: 0,
        size: '',
        weight: 0,

        quantity: 0,
        discount: 0,
        description: '',
        featured: false,
        status: true,
        categoryId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setImageFiles(files);

    // Preview images
    const imagePreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(imagePreviews);
  };

  const handleAddProduct = async () => {
    try {
      // Tạo FormData object
      const formData = new FormData();

      // Thêm các trường thông tin sản phẩm
      formData.append('productName', newProduct.productName);
      formData.append('quantity', newProduct.quantity.toString());
      formData.append('price', newProduct.price.toString());
      formData.append('size', newProduct.size);
      formData.append('weight', newProduct.weight);

      formData.append('discount', newProduct.discount.toString());
      formData.append('description', newProduct.description);
      formData.append('featured', 'false');
      formData.append('categoryId', newProduct.categoryId);

      formData.append('status', 'true');

      // Thêm các file ảnh
      imageFiles.forEach((file, index) => {
        formData.append(`images`, file);
      });

      console.log('Form Data:', Object.fromEntries(formData));

      const response = await axios.post(
        'https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Product/CreateProduct',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 200) {
        // Refresh product list
        const updatedProducts = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Product/GetAllProduct');
        setProducts(updatedProducts.data.data);

        // Reset form
        setNewProduct({
          productName: '',
          price: 0,
          size: '',
          weight: '',

          quantity: 0,
          discount: 0,
          description: '',
          featured: false,
          status: true,
          categoryId: ''
        });
        setImageFiles([]);
        setImagePreviews([]);

        setOpenDialog(false);
        setSnackbar({
          open: true,
          message: 'Product added successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setSnackbar({
        open: true,
        message: `Failed to add product: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleOpenUpdateDialog = (product) => {
    setEditingProduct(product);
    setUpdateProductData({
      productName: product.productName,
      quantity: product.quantity,
      price: product.price,
      size: product.size,
      weight: product.weight,

      discount: product.discount,
      description: product.description,
      featured: product.featured,
      categoryId: product.categoryId,
      status: product.status
    });
    setUpdateDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) {
      console.error('No product selected for update');
      setSnackbar({
        open: true,
        message: 'Product not selected for update.',
        severity: 'error'
      });
      return;
    }

    try {
      const response = await axios.put(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Product/UpdateProduct/${editingProduct.productId}`,
        updateProductData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.statusCode === 200) {
        const updatedProducts = await axios.get('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Product/GetAllProduct');
        setProducts(updatedProducts.data.data);
        setUpdateDialogOpen(false);
        setSnackbar({
          open: true,
          message: 'Cập nhật sản phẩm thành công!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating product:', error.response?.data || error);
      setSnackbar({
        open: true,
        message: `Lỗi cập nhật sản phẩm: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    setConfirmDelete({ open: true, productId: productId });
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Product/DeleteProduct/${confirmDelete.productId}`
      );

      if (response.data.statusCode === 200) {
        setProducts(products.filter((product) => product.productId !== confirmDelete.productId));
        setSnackbar({
          open: true,
          message: 'Product deleted successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete product: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setConfirmDelete({ open: false, productId: null });
    }
  };

  const resetForm = () => {
    setNewProduct({
      productName: '',
      price: 0,
      size: '',
      weight: 0,
      quantity: 0,
      discount: 0,
      description: '',
      featured: false,
      status: true,
      categoryId: ''
    });
    setImageFiles([]);
    setImagePreviews([]);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const isFormValid = () => {
    return (
      newProduct.productName &&
      newProduct.price > 0 &&
      newProduct.weight >= 0 &&

      newProduct.categoryId &&
      imageFiles.length > 0 &&
      (newProduct.discount >= 0 && newProduct.discount <= 100)
    );
  };

  // Sửa lại hàm xử lý ảnh
  const getProductImages = (product) => {
    if (!product || !product.images) {
      console.log('No product or images');
      return [];
    }

    console.log('Raw images data:', product.images);

    // Nếu images là string, thử parse JSON
    if (typeof product.images === 'string') {
      try {
        // Thử parse JSON
        const parsed = JSON.parse(product.images);
        console.log('Parsed JSON images:', parsed);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Nếu không phải JSON, split theo dấu phẩy
        const imageArray = product.images.split(',').map(url => url.trim()).filter(Boolean);
        console.log('Split string images:', imageArray);
        return imageArray;
      }
    }

    // Nếu đã là array
    if (Array.isArray(product.images)) {
      console.log('Array images:', product.images);
      return product.images;
    }

    console.log('No valid images found');
    return [];
  };

  // Hàm fetch product detail
  const fetchProductDetail = async (productId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Product/GetProductById?id=${productId}`
      );

      if (response.data.statusCode === 200) {
        setProductDetail(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching product detail:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch product details',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Product Management</h2>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Product
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* <TableCell>ID</TableCell> */}
              <TableCell>ID</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              {/* <TableCell>Store</TableCell> */}
              <TableCell>Category</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Sold</TableCell>
              <TableCell>featured</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productId}>
                <TableCell>{product.productId}</TableCell>

                {/* <TableCell>{product.productId}</TableCell> */}
                <TableCell>
                  {product.productImages && product.productImages[0]?.productImage1 && (
                    <img
                      src={product.productImages[0].productImage1}
                      alt={product.productName}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    />
                  )}
                </TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.price}</TableCell>
                {/* <TableCell>
                  {stores.find(store => store.storeId === product.storeId)?.storeName || 'Unknown Store'}
                </TableCell> */}
                <TableCell>{product.categoryName}</TableCell>
                <TableCell>{product.size}</TableCell>
                <TableCell>{product.discount}%</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.sold}</TableCell>
                <TableCell> <Chip
                  label={product.featured ? 'Yes' : 'No'}
                  color={product.featured ? 'success' : 'default'}
                  size="small"
                /></TableCell>
                <TableCell> <Chip
                  label={product.status ? 'Active' : 'Inactive'}
                  color={product.status ? 'success' : 'error'}
                  size="small"
                /></TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => {
                      setViewDetail({ open: true, product: product });
                      fetchProductDetail(product.productId);
                    }}
                    color="info"
                    title="View Detail"
                  >
                    <RemoveRedEye />
                  </IconButton>
                  <IconButton
                    onClick={() => handleOpenUpdateDialog(product)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteProduct(product.productId)}
                    color="error"
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
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div">
            Add New Product
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Product Name */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Product Name"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                  error={!newProduct.productName}
                  helperText={!newProduct.productName ? "Product name is required" : ""}
                />
              </Grid>

              {/* Price and Quantity */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Price (VND)"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  error={newProduct.price <= 0}
                  helperText={newProduct.price <= 0 ? "Price must be greater than 0" : ""}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Size and Discount */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="size-label">Size</InputLabel>
                  <Select
                    labelId="size-label"
                    value={newProduct.size}
                    label="Size"
                    onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                  >
                    <MenuItem value="Large">Large</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Small">Small</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Discount (%)"
                  type="number"
                  value={newProduct.discount}
                  onChange={(e) => setNewProduct({ ...newProduct, discount: Number(e.target.value) })}
                  error={newProduct.discount < 0 || newProduct.discount > 100}
                  helperText={newProduct.discount < 0 || newProduct.discount > 100 ? "Discount must be between 0-100%" : ""}
                  InputProps={{
                    inputProps: { min: 0, max: 100 },
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Weight"
                  type="number"
                  value={newProduct.weight}
                  onChange={(e) => setNewProduct({ ...newProduct, weight: Number(e.target.value) })}
                  error={newProduct.weight <= 0}
                  helperText={newProduct.priweightce <= 0 ? "weight must be greater than 0" : ""}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                  }}
                  placeholder="Enter weight"
                />
              </Grid>
              {/* Category */}
              <Grid item xs={12}>
                <FormControl fullWidth required error={!newProduct.categoryId}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </MenuItem>
                    ))}
                  </Select>
                  {!newProduct.categoryId &&
                    <FormHelperText>Please select a category</FormHelperText>
                  }
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter product description"
                />
              </Grid>

              {/* Featured and Status Switches */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newProduct.featured}
                      onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Featured Product"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newProduct.status}
                      onChange={(e) => setNewProduct({ ...newProduct, status: e.target.checked })}
                      color="success"
                    />
                  }
                  label="Active Status"
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    id="product-images"
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <label htmlFor="product-images">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      sx={{ mr: 2 }}
                    >
                      Upload Images
                    </Button>
                  </label>
                  {imageFiles.length > 0 && (
                    <Typography variant="caption" color="textSecondary">
                      {imageFiles.length} file(s) selected
                    </Typography>
                  )}
                </Box>

                {/* Image Previews */}
                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  mb: 2
                }}>
                  {imagePreviews.map((preview, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': { backgroundColor: 'white' }
                        }}
                        onClick={() => removeImage(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setOpenDialog(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddProduct}
            disabled={!isFormValid()}
          >
            Add Product
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Update Product</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Product Name"
            fullWidth
            value={updateProductData.productName}
            onChange={(e) => setUpdateProductData({
              ...updateProductData,
              productName: e.target.value
            })}
          />

          <TextField
            margin="dense"
            label="Price"
            fullWidth
            type="number"
            value={updateProductData.price}
            onChange={(e) => setUpdateProductData({
              ...updateProductData,
              price: parseFloat(e.target.value)
            })}
          />
          <TextField
            margin="dense"
            label="Size"
            fullWidth
            value={updateProductData.size}
            onChange={(e) => setUpdateProductData({
              ...updateProductData,
              size: e.target.value
            })}
          />
           <TextField
            margin="dense"
            label="Weight"
            fullWidth
            value={updateProductData.weight}
            onChange={(e) => setUpdateProductData({
              ...updateProductData,
              weight: e.target.value
            })}
          />
          <TextField
            margin="dense"
            label="Discount (%)"
            fullWidth
            type="number"
            value={updateProductData.discount}
            onChange={(e) => setUpdateProductData({
              ...updateProductData,
              discount: parseInt(e.target.value)
            })}
          />

          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={updateProductData.description}
            onChange={(e) => setUpdateProductData({
              ...updateProductData,
              description: e.target.value
            })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={updateProductData.categoryId}
              label="Danh mục"
              onChange={(e) => setUpdateProductData({
                ...updateProductData,
                categoryId: e.target.value
              })}
            >
              {categories.map((category) => (
                <MenuItem key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: 'darkred', } }} onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateProduct}>
            Update
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, productId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this product?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, productId: null })}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewDetail.open}
        onClose={() => {
          setViewDetail({ open: false, product: null });
          setProductDetail(null);
          setSelectedImageIndex(0);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6">Product Details</Typography>
          <IconButton
            onClick={() => {
              setViewDetail({ open: false, product: null });
              setProductDetail(null);
              setSelectedImageIndex(0);
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : productDetail && (
            <Grid container spacing={3}>
              {/* Left side - Image */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Main Image */}
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
                    {productDetail.productImages?.length > 0 && (
                      <>
                        <img
                          src={productDetail.productImages[selectedImageIndex].productImage1}
                          alt={productDetail.productName}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />

                        {/* Navigation Arrows - chỉ hiện khi có nhiều hơn 1 ảnh */}
                        {productDetail.productImages.length > 1 && (
                          <>
                            <IconButton
                              sx={{
                                position: 'absolute',
                                left: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                '&:hover': { backgroundColor: 'white' }
                              }}
                              onClick={() => setSelectedImageIndex(prev =>
                                prev === 0 ? productDetail.productImages.length - 1 : prev - 1
                              )}
                            >
                              <ChevronLeft />
                            </IconButton>
                            <IconButton
                              sx={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                '&:hover': { backgroundColor: 'white' }
                              }}
                              onClick={() => setSelectedImageIndex(prev =>
                                prev === productDetail.productImages.length - 1 ? 0 : prev + 1
                              )}
                            >
                              <ChevronRight />
                            </IconButton>
                          </>
                        )}
                      </>
                    )}
                  </Paper>

                  {/* Thumbnails */}
                  {productDetail.productImages?.length > 0 && (
                    <Box sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      mt: 2
                    }}>
                      {productDetail.productImages.map((image, index) => (
                        <Paper
                          key={image.productImageId}
                          elevation={selectedImageIndex === index ? 3 : 1}
                          sx={{
                            width: 80,
                            height: 80,
                            cursor: 'pointer',
                            border: selectedImageIndex === index ? '2px solid #1976d2' : 'none',
                            overflow: 'hidden',
                            borderRadius: 1,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={image.productImage1}
                            alt={`${productDetail.productName} - ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {/* Image Counter */}
                  {productDetail.productImages?.length > 0 && (
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mt: 1
                    }}>
                      <Typography variant="caption" color="textSecondary">
                        Image {selectedImageIndex + 1} of {productDetail.productImages.length}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Right side - Product Information */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Product Name and ID */}
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {productDetail.productName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Product ID: {productDetail.productId}
                    </Typography>
                  </Box>

                  {/* Price and Discount */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" color="primary">
                      {productDetail.price.toLocaleString()} VND
                    </Typography>
                    {productDetail.discount > 0 && (
                      <Chip
                        label={`-${productDetail.discount}%`}
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>

                  {/* Status and Stock */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip
                      label={productDetail.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      color={productDetail.quantity > 0 ? 'success' : 'error'}
                    />
                    <Typography>
                      {productDetail.quantity} items available
                    </Typography>
                  </Box>

                  {/* Detailed Information */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Category</TableCell>
                          <TableCell>{productDetail.categoryName || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                          <TableCell>{productDetail.size || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Weight</TableCell>
                          <TableCell>{productDetail.weight || 'N/A'} kg</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Sold</TableCell>
                          <TableCell>{productDetail.sold}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Featured</TableCell>
                          <TableCell>
                            <Chip
                              label={productDetail.featured ? 'Yes' : 'No'}
                              color={productDetail.featured ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell>
                            <Chip
                              label={productDetail.status ? 'Active' : 'Inactive'}
                              color={productDetail.status ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                          <TableCell>{new Date(productDetail.createAt).toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Updated At</TableCell>
                          <TableCell>
                            {productDetail.updateAt ? new Date(productDetail.updateAt).toLocaleString() : 'N/A'}
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
                        {productDetail.description || 'No description available'}
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

export default ProductManagement;