import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControlLabel, Switch, Grid
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function RemarkOptionsMaster() {
  const [remarkOptions, setRemarkOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchRemarkOptions();
  }, []);

  const fetchRemarkOptions = async () => {
    try {
      const res = await api.get("api/remark-options");
      if (res && res.data) {
        setRemarkOptions(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setName(item.name || "");
      // Convert true/false or 1/0 from DB to boolean properly
      setIsActive(Boolean(item.is_active));
    } else {
      setEditId(null);
      setName("");
      setIsActive(true); // Default to active true
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setIsActive(true);
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    const payload = { 
      name: name,
      is_active: isActive
    };

    try {
      if (editId) {
        const resPut = await api.put(`api/remark-options/${editId}`, payload);
        if(!resPut) return;
        toast.success("Remark Option updated successfully");
      } else {
        const resPost = await api.post("api/remark-options", payload);
        if(!resPost) return;
        toast.success("Remark Option added successfully");
      }
      handleClose();
      fetchRemarkOptions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this remark option?")) {
      try {
        const resDel = await api.delete(`api/remark-options/${id}`);
        if(!resDel) return;
        toast.success("Remark Option deleted successfully");
        fetchRemarkOptions();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Remark Options</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Is Active?</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {remarkOptions.length > 0 ? (
              remarkOptions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Typography color={row.is_active ? "success.main" : "error.main"}>
                      {row.is_active ? "Yes" : "No"}
                    </Typography>
                  </TableCell>
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
                <TableCell colSpan={4} align="center">No Remark Options Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Remark Option" : "Add Remark Option"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Name (e.g., Hide)"
                type="text"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="primary"
                  />
                }
                label="Is Active?"
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
