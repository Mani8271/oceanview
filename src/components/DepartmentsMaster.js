import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function DepartmentsMaster() {
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("api/departments");
      if (res && res.data) {
        setDepartments(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (dept = null) => {
    if (dept) {
      setEditId(dept.id);
      setDepartmentName(dept.department_name);
    } else {
      setEditId(null);
      setDepartmentName("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDepartmentName("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!departmentName.trim()) {
      toast.error("Department Name is required");
      return;
    }

    try {
      if (editId) {
        const resPut = await api.put(`api/departments/${editId}`, { department_name: departmentName });
        if(!resPut) return;
        toast.success("Department updated successfully");
      } else {
        const resPost = await api.post("api/departments", { department_name: departmentName });
        if(!resPost) return;
        toast.success("Department added successfully");
      }
      handleClose();
      fetchDepartments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        const resDel = await api.delete(`api/departments/${id}`);
        if(!resDel) return;
        toast.success("Department deleted successfully");
        fetchDepartments();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Departments</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Department Name</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.length > 0 ? (
              departments.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.department_name}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" color="primary" sx={{ mr: 1 }} onClick={() => handleOpen(row)}>
                      Edit
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(row.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">No Departments Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Department" : "Add Department"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Department Name"
            type="text"
            fullWidth
            variant="outlined"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
