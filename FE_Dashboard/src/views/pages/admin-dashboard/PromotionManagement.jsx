import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Paper, Snackbar, Alert, FormControlLabel, Switch, Grid, Typography, Chip } from "@mui/material";
import { Delete, Edit, Add, CloudUpload, Close, Visibility } from "@mui/icons-material";

const API_BASE_URL = "https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api";

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, promotionId: null, promotionName: '' });
  const [viewDetail, setViewDetail] = useState({
    open: false,
    promotion: null
  });

  const [newPromotion, setNewPromotion] = useState({
    promotionName: "",
    quantity: "",
    promotionDiscount: "",
    promotionCode: "",
    startDate: "",
    endDate: "",
    image: null,
    status: true
  });

  const [formErrors, setFormErrors] = useState({
    promotionName: "",
    quantity: "",
    promotionDiscount: "",
    promotionCode: "",
    startDate: "",
    endDate: "",
    image: ""
  });

  const fetchPromotions = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/promotions`);
      setPromotions(data);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewPromotion(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleUpdateImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedPromotion(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const validatePromotion = () => {
    const errors = {};
    let isValid = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!newPromotion.promotionName) {
      errors.promotionName = "Promotion name is required";
      isValid = false;
    } else if (newPromotion.promotionName.length < 3) {
      errors.promotionName = "Promotion name must be at least 3 characters";
      isValid = false;
    }

    if (!newPromotion.quantity) {
      errors.quantity = "Quantity is required";
      isValid = false;
    } else if (parseInt(newPromotion.quantity) <= 0) {
      errors.quantity = "Quantity must be greater than 0";
      isValid = false;
    }

    if (!newPromotion.promotionDiscount) {
      errors.promotionDiscount = "Discount percentage is required";
      isValid = false;
    } else {
      const discount = parseInt(newPromotion.promotionDiscount);
      if (discount <= 0 || discount > 100) {
        errors.promotionDiscount = "Discount must be between 1 and 100";
        isValid = false;
      }
    }

    if (!newPromotion.promotionCode) {
      errors.promotionCode = "Promotion code is required";
      isValid = false;
    } else if (!/^[A-Z0-9]{4,10}$/.test(newPromotion.promotionCode)) {
      errors.promotionCode = "Code must be 4-10 characters, uppercase letters and numbers only";
      isValid = false;
    }

    if (!newPromotion.startDate) {
      errors.startDate = "Start date is required";
      isValid = false;
    } else {
      const startDate = new Date(newPromotion.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate < today) {
        errors.startDate = "Start date cannot be in the past";
        isValid = false;
      }
    }

    if (!newPromotion.endDate) {
      errors.endDate = "End date is required";
      isValid = false;
    } else {
      const endDate = new Date(newPromotion.endDate);
      endDate.setHours(0, 0, 0, 0);
      const startDate = new Date(newPromotion.startDate);
      startDate.setHours(0, 0, 0, 0);
  
      if (endDate <= startDate) {
        errors.endDate = "End date must be after start date";
        isValid = false;
      }
      
      if (endDate < today) {
        errors.endDate = "End date cannot be in the past";
        isValid = false;
      }
    }

    if (!newPromotion.image) {
      errors.image = "Image is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddPromotion = async () => {
    if (!validatePromotion()) {
      setSnackbar({ 
        open: true, 
        message: "Please check your input information", 
        severity: "error" 
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('PromotionName', newPromotion.promotionName);
      formData.append('Quantity', newPromotion.quantity);
      formData.append('PromotionDiscount', newPromotion.promotionDiscount);
      formData.append('PromotionCode', newPromotion.promotionCode);
      formData.append('StartDate', newPromotion.startDate);
      formData.append('EndDate', newPromotion.endDate);
      formData.append('Status', newPromotion.status);
      formData.append('Image', newPromotion.image);

      const { data } = await axios.post(
        `${API_BASE_URL}/promotions/create-promotion`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const createdPromotion = {
        ...data.data,
        startDate: data.data.startDate.split("T")[0],
        endDate: data.data.endDate.split("T")[0],
      };

      setPromotions((prev) => [...prev, createdPromotion]);
      setOpenDialog(false);

      setNewPromotion({
        promotionName: "",
        quantity: "",
        promotionDiscount: "",
        promotionCode: "",
        startDate: "",
        endDate: "",
        image: null,
        status: true
      });

      setFormErrors({
        promotionName: "",
        quantity: "",
        promotionDiscount: "",
        promotionCode: "",
        startDate: "",
        endDate: "",
        image: ""
      });
      setSnackbar({ open: true, message: "Promotion added successfully!", severity: "success" });
    } catch (error) {
      console.error("Failed to create promotion:", error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || "An error occurred while adding the promotion.", 
        severity: "error" 
      });
    }
  };

  const handleDeletePromotion = async () => {
    try {
      const { data } = await axios.delete(
        `${API_BASE_URL}/promotions/delete-promotion`,
        { params: { id: confirmDialog.promotionId } }
      );

      if (data.resultStatus === "Success") {
        setPromotions((prev) =>
          prev.filter((promo) => promo.promotionId !== confirmDialog.promotionId)
        );
        setSnackbar({ open: true, message: "Promotion deleted successfully!", severity: "success" });
      } else {
        setSnackbar({ open: true, message: data.messages[0] || "Failed to delete promotion.", severity: "error" });
      }
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      setSnackbar({ open: true, message: "An error occurred while deleting the promotion.", severity: "error" });
    } finally {
      setConfirmDialog({ open: false, promotionId: null, promotionName: '' });
    }
  };

  const handleEditPromotion = async () => {
    if (!selectedPromotion) return;

    try {
      const formData = new FormData();
      formData.append('PromotionName', selectedPromotion.promotionName);
      formData.append('Quantity', selectedPromotion.quantity.toString());
      formData.append('PromotionDiscount', selectedPromotion.promotionDiscount.toString());
      formData.append('PromotionCode', selectedPromotion.promotionCode);
      formData.append('StartDate', selectedPromotion.startDate);
      formData.append('EndDate', selectedPromotion.endDate);
      formData.append('Status', selectedPromotion.status.toString());
      
      if (selectedPromotion.image instanceof File) {
        formData.append('Image', selectedPromotion.image);
      }

      const response = await axios.put(
        `${API_BASE_URL}/promotions/${selectedPromotion.promotionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 200) {
        setEditDialog(false);
        setSelectedPromotion(null);
        setSnackbar({ open: true, message: "Promotion updated successfully!", severity: "success" });
        fetchPromotions();
      }
    } catch (error) {
      console.error("Failed to update promotion:", error);
      setSnackbar({ open: true, message: "An error occurred while updating the promotion.", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Promotion Management</h2>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          Add Promotion
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Discount (%)</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promotions.map((promotion) => (
              <TableRow key={promotion.promotionId}>
                <TableCell>
                  {promotion.image && (
                    <img
                      src={promotion.image}
                      alt={promotion.promotionName}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>{promotion.promotionName}</TableCell>
                <TableCell>{promotion.quantity}</TableCell>
                <TableCell>{promotion.promotionDiscount}</TableCell>
                <TableCell>{promotion.promotionCode}</TableCell>
                <TableCell>{new Date(promotion.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(promotion.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={promotion.status ? 'Active' : 'Inactive'}
                    color={promotion.status ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="info"
                    onClick={() => setViewDetail({ open: true, promotion: promotion })}
                    title="View Details"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setSelectedPromotion(promotion);
                      setEditDialog(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => setConfirmDialog({ open: true, promotionId: promotion.promotionId, promotionName: promotion.promotionName })}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Add New Promotion</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={newPromotion.promotionName}
            onChange={(e) =>
              setNewPromotion({ ...newPromotion, promotionName: e.target.value })
            }
            error={!!formErrors.promotionName}
            helperText={formErrors.promotionName}
          />
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            value={newPromotion.quantity}
            onChange={(e) =>
              setNewPromotion({ ...newPromotion, quantity: e.target.value })
            }
            error={!!formErrors.quantity}
            helperText={formErrors.quantity}
          />
          <TextField
            margin="dense"
            label="Discount (%)"
            type="number"
            fullWidth
            value={newPromotion.promotionDiscount}
            onChange={(e) =>
              setNewPromotion({
                ...newPromotion,
                promotionDiscount: e.target.value,
              })
            }
            error={!!formErrors.promotionDiscount}
            helperText={formErrors.promotionDiscount}
          />
          <TextField
            margin="dense"
            label="Code"
            fullWidth
            value={newPromotion.promotionCode}
            onChange={(e) =>
              setNewPromotion({ ...newPromotion, promotionCode: e.target.value })
            }
            error={!!formErrors.promotionCode}
            helperText={formErrors.promotionCode}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newPromotion.startDate}
            onChange={(e) =>
              setNewPromotion({ ...newPromotion, startDate: e.target.value })
            }
            error={!!formErrors.startDate}
            helperText={formErrors.startDate}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newPromotion.endDate}
            onChange={(e) =>
              setNewPromotion({ ...newPromotion, endDate: e.target.value })
            }
            error={!!formErrors.endDate}
            helperText={formErrors.endDate}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newPromotion.status}
                onChange={(e) => setNewPromotion({ ...newPromotion, status: e.target.checked })}
              />
            }
            label="Active Status"
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2 }}>
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
            {formErrors.image && (
              <Typography color="error" variant="caption" display="block">
                {formErrors.image}
              </Typography>
            )}
          </Box>
          {newPromotion.image && (
            <Box sx={{ mt: 2, position: 'relative', width: 200, height: 200 }}>
              <img
                src={URL.createObjectURL(newPromotion.image)}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 4
                }}
              />
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { backgroundColor: 'white' }
                }}
                onClick={() => setNewPromotion(prev => ({ ...prev, image: null }))}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: 'darkred', } }} onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPromotion}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Edit Promotion</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={selectedPromotion?.promotionName || ""}
              onChange={(e) =>
                setSelectedPromotion({
                  ...selectedPromotion,
                  promotionName: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Quantity"
              type="number"
              fullWidth
              value={selectedPromotion?.quantity || ""}
              onChange={(e) =>
                setSelectedPromotion({
                  ...selectedPromotion,
                  quantity: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Discount (%)"
              type="number"
              fullWidth
              value={selectedPromotion?.promotionDiscount || ""}
              onChange={(e) =>
                setSelectedPromotion({
                  ...selectedPromotion,
                  promotionDiscount: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Code"
              fullWidth
              value={selectedPromotion?.promotionCode || ""}
              onChange={(e) =>
                setSelectedPromotion({
                  ...selectedPromotion,
                  promotionCode: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={selectedPromotion?.startDate?.split('T')[0] || ""}
              onChange={(e) =>
                setSelectedPromotion({
                  ...selectedPromotion,
                  startDate: e.target.value,
                })
              }
            />
            <TextField
              margin="dense"
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={selectedPromotion?.endDate?.split('T')[0] || ""}
              onChange={(e) =>
                setSelectedPromotion({
                  ...selectedPromotion,
                  endDate: e.target.value,
                })
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={selectedPromotion?.status || false}
                  onChange={(e) =>
                    setSelectedPromotion({
                      ...selectedPromotion,
                      status: e.target.checked,
                    })
                  }
                />
              }
              label="Active Status"
            />

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
              >
                Update Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleUpdateImageChange}
                />
              </Button>
            </Box>

            {selectedPromotion && (
              <Box sx={{ mt: 2, position: 'relative', width: 200, height: 200 }}>
                <img
                  src={selectedPromotion.image instanceof File 
                    ? URL.createObjectURL(selectedPromotion.image)
                    : selectedPromotion.image}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 4
                  }}
                />
                {selectedPromotion.image instanceof File && (
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { backgroundColor: 'white' }
                    }}
                    onClick={() => setSelectedPromotion(prev => ({ ...prev, image: null }))}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            sx={{ 
              backgroundColor: 'red', 
              color: 'white', 
              '&:hover': { backgroundColor: 'darkred' } 
            }} 
            onClick={() => setEditDialog(false)}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleEditPromotion}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, promotionId: null, promotionName: '' })}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete the promotion: <strong>{confirmDialog.promotionName}</strong>?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, promotionId: null, promotionName: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeletePromotion}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewDetail.open}
        onClose={() => setViewDetail({ open: false, promotion: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Promotion Details
          <IconButton onClick={() => setViewDetail({ open: false, promotion: null })}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {viewDetail.promotion && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <img
                  src={viewDetail.promotion.image}
                  alt={viewDetail.promotion.promotionName}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '400px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h5" gutterBottom>
                    {viewDetail.promotion.promotionName}
                  </Typography>

                  <Typography color="text.secondary" variant="body2">
                    ID: {viewDetail.promotion.promotionId}
                  </Typography>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Promotion Code
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {viewDetail.promotion.promotionCode}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Discount
                    </Typography>
                    <Typography>
                      {viewDetail.promotion.promotionDiscount}%
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Quantity
                    </Typography>
                    <Typography>{viewDetail.promotion.quantity}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography>
                      From: {new Date(viewDetail.promotion.startDate).toLocaleDateString()} <br />
                      To: {new Date(viewDetail.promotion.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={viewDetail.promotion.status ? 'Active' : 'Inactive'}
                      color={viewDetail.promotion.status ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Used Count
                    </Typography>
                    <Typography>
                      {viewDetail.promotion.usedCount || 0}
                    </Typography>
                  </Box>

                  {viewDetail.promotion.description && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography>
                        {viewDetail.promotion.description}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setViewDetail({ open: false, promotion: null })}
          >
            Close
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PromotionManagement;
