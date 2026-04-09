import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function GrossAmountOptionsMaster() {
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get("api/total-gross-options");
      if (res && res.data) {
        setOptions(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setName(item.name || "");
    } else {
      setEditId(null);
      setName("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    const payload = { name };

    try {
      if (editId) {
        const resPut = await api.put(`api/total-gross-options/${editId}`, payload);
        if(!resPut) return;
        toast.success("Option updated successfully");
      } else {
        const resPost = await api.post("api/total-gross-options", payload);
        if(!resPost) return;
        toast.success("Option added successfully");
      }
      handleClose();
      fetchOptions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this option?")) {
      try {
        const resDel = await api.delete(`api/total-gross-options/${id}`);
        if(!resDel) return;
        toast.success("Option deleted successfully");
        fetchOptions();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Total Gross Amount Options</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Name</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {options.length > 0 ? (
              options.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
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
                <TableCell colSpan={3} align="center">No Options Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Option" : "Add Gross Option"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Option Name (e.g., Both, Copy Paste)"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
