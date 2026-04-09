import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function CategoriesMaster() {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchDepartments();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("api/categories");
      if (res && res.data) {
        setCategories(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  const handleOpen = (category = null) => {
    if (category) {
      setEditId(category.id);
      setCategoryName(category.category_name);
      setDepartmentId(category.department_id);
    } else {
      setEditId(null);
      setCategoryName("");
      setDepartmentId("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCategoryName("");
    setDepartmentId("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      toast.error("Category Name is required");
      return;
    }
    if (!departmentId) {
      toast.error("Department is required");
      return;
    }

    try {
      if (editId) {
        const resPut = await api.put(`api/categories/${editId}`, { 
          category_name: categoryName,
          department_id: departmentId
        });
        if(!resPut) return;
        toast.success("Category updated successfully");
      } else {
        const resPost = await api.post("api/categories", { 
          category_name: categoryName,
          department_id: departmentId
        });
        if(!resPost) return;
        toast.success("Category added successfully");
      }
      handleClose();
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const resDel = await api.delete(`api/categories/${id}`);
        if(!resDel) return;
        toast.success("Category deleted successfully");
        fetchCategories();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.department_name : "-";
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Categories</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Category Name</b></TableCell>
              <TableCell><b>Department</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length > 0 ? (
              categories.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.category_name}</TableCell>
                  <TableCell>{row.department ? row.department.department_name : getDepartmentName(row.department_id)}</TableCell>
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
                <TableCell colSpan={4} align="center">No Categories Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel id="department-select-label">Department</InputLabel>
            <Select
              labelId="department-select-label"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              label="Department"
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.department_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
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
