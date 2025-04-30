import React, { useState, useEffect } from "react";
import { Box, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Snackbar, Alert, TextField } from "@mui/material";
import { Delete, Edit, Visibility, Close, CheckCircle, Cancel } from "@mui/icons-material";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const FloristManagement = () => {
  const [activeFlorists, setActiveFlorists] = useState([]);
  const [pendingFlorists, setPendingFlorists] = useState([]);
  const [viewDetail, setViewDetail] = useState({ open: false, florist: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [rejectDialog, setRejectDialog] = useState({
    open: false,
    florist: null,
    reason: ''
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    florist: null
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    florist: null
  });

  const fetchFlorists = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      const decodedToken = jwtDecode(token);
      const storeId = decodedToken.StoreId;

      // Fetch active florists
      const activeResponse = await axios.get(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/employees/storeId-florist-status-true?storeid=${storeId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Fetch pending florists
      const pendingResponse = await axios.get(
        `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/employees/storeId-florist-status-false?storeid=${storeId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (activeResponse.data.data) {
        setActiveFlorists(activeResponse.data.data);
      }
      if (pendingResponse.data.data) {
        setPendingFlorists(pendingResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching florists:', error);
    }
  };

  useEffect(() => {
    fetchFlorists();
  }, []);

  const handleApprove = async (florist) => {
    try {
      console.log('Approving florist:', florist);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios({
        method: 'post',
        url: `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/employees/ApproveEmployee`,
        params: {
          employeeId: florist.employeeId
        },
        data: '',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      console.log('Approve response:', response);

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Employee approved successfully!',
          severity: 'success'
        });
        
        await fetchFlorists();
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error);
      setSnackbar({
        open: true,
        message: `Failed to approve employee: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios({
        method: 'post',
        url: `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/employees/RejectEmployee`,
        params: {
          employeeId: rejectDialog.florist.employeeId,
          reason: rejectDialog.reason
        },
        data: '',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Employee rejected successfully!',
          severity: 'success'
        });
        setRejectDialog({ open: false, florist: null, reason: '' }); // Reset dialog
        await fetchFlorists(); // Refresh data
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error);
      setSnackbar({
        open: true,
        message: `Failed to reject employee: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Đảo ngược status hiện tại
      const newStatus = !editDialog.florist.status;

      const response = await axios({
        method: 'put',
        url: `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/employees/updateEmployeeStatus`,
        params: {
          employeeId: editDialog.florist.employeeId,
          Status: newStatus
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: `Employee status updated to ${newStatus ? 'Active' : 'Inactive'} successfully!`,
          severity: 'success'
        });
        setEditDialog({ open: false, florist: null });
        await fetchFlorists(); // Refresh data
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error);
      setSnackbar({
        open: true,
        message: `Failed to update status: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios({
        method: 'delete',
        url: `https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/employees/delete-employee`,
        params: {
          id: deleteDialog.florist.employeeId
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Employee deleted successfully!',
          severity: 'success'
        });
        setDeleteDialog({ open: false, florist: null });
        await fetchFlorists(); // Refresh data
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error);
      setSnackbar({
        open: true,
        message: `Failed to delete employee: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h3">Pending Florist Applications</Typography>
      </Box>
      <TableContainer 
        component={Paper}
        sx={{
          '& .MuiTableCell-root': {
            textAlign: 'center',
            padding: '8px 16px'
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
            <TableCell>Avatar</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Birthday</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingFlorists.map((florist) => (
              <TableRow key={florist.employeeId}>
                <TableCell>
                  <Avatar
                    src={florist.avatar}
                    alt={florist.fullName}
                    sx={{ width: 40, height: 40 }}
                  />
                </TableCell>
                <TableCell>{florist.fullName}</TableCell>
                <TableCell>{florist.address}</TableCell>
                <TableCell>{florist.email}</TableCell>
                <TableCell>{florist.phone}</TableCell>
                <TableCell>{florist.gender ? 'Male' : 'Female'}</TableCell>
                <TableCell>
                  {new Date(florist.birthday).toLocaleDateString('en-GB')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={florist.status ? 'Active' : 'Inactive'}
                    color={florist.status ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      gap: 1 
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => setViewDetail({ open: true, florist: florist })}
                      sx={{
                        backgroundColor: '#2196f3',
                        color: 'white',
                        textTransform: 'none',
                        minWidth: '90px',
                        '&:hover': {
                          backgroundColor: '#1976d2'
                        }
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => handleApprove(florist)}
                      sx={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        textTransform: 'none',
                        minWidth: '90px',
                        '&:hover': {
                          backgroundColor: '#388e3c'
                        }
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => setRejectDialog({ open: true, florist: florist, reason: '' })}
                      sx={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        textTransform: 'none',
                        minWidth: '90px',
                        '&:hover': {
                          backgroundColor: '#d32f2f'
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
        <Typography variant="h3">Current Florists</Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Birthday</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {activeFlorists.map((florist) => (
              <TableRow key={florist.employeeId}>
                <TableCell>
                  <Avatar
                    src={florist.avatar}
                    alt={florist.fullName}
                    sx={{ width: 40, height: 40 }}
                  />
                </TableCell>
                <TableCell>{florist.fullName}</TableCell>
                <TableCell>{florist.address}</TableCell>
                <TableCell>{florist.email}</TableCell>
                <TableCell>{florist.phone}</TableCell>
                <TableCell>{florist.gender ? 'Male' : 'Female'}</TableCell>
                <TableCell>
                  {new Date(florist.birthday).toLocaleDateString('en-GB')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={florist.status ? 'Active' : 'Inactive'}
                    color={florist.status ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="info"
                    sx={{ mr: 1 }}
                    onClick={() => setViewDetail({ open: true, florist: florist })}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    color="primary"
                    sx={{ mr: 1 }}
                    onClick={() => setEditDialog({ open: true, florist: florist })}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, florist: florist })}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add View Detail Dialog */}
      <Dialog
        open={viewDetail.open}
        onClose={() => setViewDetail({ open: false, florist: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Florist Details
          <IconButton onClick={() => setViewDetail({ open: false, florist: null })}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {viewDetail.florist && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Avatar
                    src={viewDetail.florist.avatar}
                    alt={viewDetail.florist.fullName}
                    sx={{ width: 200, height: 200, mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {viewDetail.florist.fullName}
                  </Typography>
                  <Chip
                    label={viewDetail.florist.status ? 'Active' : 'Inactive'}
                    color={viewDetail.florist.status ? 'success' : 'error'}
                    sx={{ width: 'fit-content' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Employee ID
                    </Typography>
                    <Typography>{viewDetail.florist.employeeId}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Role
                    </Typography>
                    <Typography>{viewDetail.florist.roleName}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography>{viewDetail.florist.email}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography>{viewDetail.florist.phone}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography>{viewDetail.florist.address}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography>{viewDetail.florist.gender ? 'Male' : 'Female'}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Birthday
                    </Typography>
                    <Typography>
                      {new Date(viewDetail.florist.birthday).toLocaleDateString('en-GB')}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Identification Number
                    </Typography>
                    <Typography>{viewDetail.florist.identificationNumber}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Identification Photos
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Front Side
                    </Typography>
                    <img
                      src={viewDetail.florist.identificationFontOfPhoto}
                      alt="ID Front"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px'
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Back Side
                    </Typography>
                    <img
                      src={viewDetail.florist.identificationBackOfPhoto}
                      alt="ID Back"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px'
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setViewDetail({ open: false, florist: null })}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, florist: null, reason: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reject Florist Application
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Are you sure you want to reject {rejectDialog.florist?.fullName}'s application?
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Reason for Rejection"
              fullWidth
              multiline
              rows={4}
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRejectDialog({ open: false, florist: null, reason: '' })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={!rejectDialog.reason.trim()} // Disable if no reason provided
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, florist: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update Employee Status
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Are you sure you want to change {editDialog.florist?.fullName}'s status from{' '}
              <strong>{editDialog.florist?.status ? 'Active' : 'Inactive'}</strong> to{' '}
              <strong>{!editDialog.florist?.status ? 'Active' : 'Inactive'}</strong>?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialog({ open: false, florist: null })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus}
            color="primary"
            variant="contained"
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, florist: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Delete Employee
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Are you sure you want to delete employee <strong>{deleteDialog.florist?.fullName}</strong>?
            </Typography>
            <Typography variant="body2" color="error">
              This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, florist: null })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FloristManagement;