import React, { useState } from 'react';
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
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';

const StaffManagement = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', position: 'Florist' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', position: 'Couriver' },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', position: '' });

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleAddEmployee = () => {
    setEmployees([...employees, { id: Date.now(), ...newEmployee }]);
    setNewEmployee({ name: '', email: '', position: '' });
    setOpenDialog(false);
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(employees.filter((employee) => employee.id !== id));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Staff Management</h2>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          Add Staff
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Position</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.id}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteEmployee(employee.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>


      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Position"
            fullWidth
            value={newEmployee.position}
            onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEmployee}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;
