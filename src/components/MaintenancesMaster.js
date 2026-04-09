import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function MaintenancesMaster() {
  const [maintenances, setMaintenances] = useState([]);
  const [open, setOpen] = useState(false);
  
  // Form fields
  const [departmentName, setDepartmentName] = useState("");
  const [category, setCategory] = useState("");
  const [remark, setRemark] = useState("");
  const [issueType, setIssueType] = useState("");
  
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const fetchMaintenances = async () => {
    try {
      const res = await api.get("api/maintenances");
      if (res && res.data) {
        setMaintenances(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setDepartmentName(item.department_name || "");
      setCategory(item.category || "");
      setRemark(item.remark || "");
      setIssueType(item.issue_type || "");
    } else {
      setEditId(null);
      setDepartmentName("");
      setCategory("");
      setRemark("");
      setIssueType("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDepartmentName("");
    setCategory("");
    setRemark("");
    setIssueType("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!departmentName.trim()) {
      toast.error("Department Name is required");
      return;
    }

    const payload = { 
      department_name: departmentName,
      category: category,
      remark: remark,
      issue_type: issueType
    };

    try {
      if (editId) {
        const resPut = await api.put(`api/maintenances/${editId}`, payload);
        if(!resPut) return;
        toast.success("Maintenance Master updated successfully");
      } else {
        const resPost = await api.post("api/maintenances", payload);
        if(!resPost) return;
        toast.success("Maintenance Master added successfully");
      }
      handleClose();
      fetchMaintenances();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this maintenance master?")) {
      try {
        const resDel = await api.delete(`api/maintenances/${id}`);
        if(!resDel) return;
        toast.success("Maintenance Master deleted successfully");
        fetchMaintenances();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Maintenance Master</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Department</b></TableCell>
              <TableCell><b>Category</b></TableCell>
              <TableCell><b>Remark</b></TableCell>
              <TableCell><b>Issue Type</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maintenances.length > 0 ? (
              maintenances.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.department_name}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.remark}</TableCell>
                  <TableCell>{row.issue_type}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" color="primary" sx={{ mr: 1, mb: 1 }} onClick={() => handleOpen(row)}>
                      Edit
                    </Button>
                    <Button size="small" variant="outlined" color="error" sx={{ mb: 1 }} onClick={() => handleDelete(row.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No Maintenances Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Maintenance" : "Add Maintenance"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Department Name (e.g., AC)"
                type="text"
                fullWidth
                variant="outlined"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Category (e.g., No Cooling)"
                type="text"
                fullWidth
                variant="outlined"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Remark (e.g., AC NO COOLING)"
                type="text"
                fullWidth
                variant="outlined"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Issue Type (e.g., Gas leak problem)"
                type="text"
                fullWidth
                variant="outlined"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
              />
            </Grid>
          </Grid>
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
