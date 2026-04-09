import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function TaxesMaster() {
  const [taxes, setTaxes] = useState([]);
  const [open, setOpen] = useState(false);
  const [taxValue, setTaxValue] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      const res = await api.get("api/taxes");
      if (res && res.data) {
        setTaxes(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (tax = null) => {
    if (tax) {
      setEditId(tax.id);
      setTaxValue(tax.tax_value);
    } else {
      setEditId(null);
      setTaxValue("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTaxValue("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (taxValue === "" || taxValue === null) {
      toast.error("Tax Value is required");
      return;
    }

    // Convert to number explicitly, though parsing depends on exactly how Strict the backend is
    const payload = { tax_value: Number(taxValue) };

    try {
      if (editId) {
        const resPut = await api.put(`api/taxes/${editId}`, payload);
        if(!resPut) return;
        toast.success("Tax updated successfully");
      } else {
        const resPost = await api.post("api/taxes", payload);
        if(!resPost) return;
        toast.success("Tax added successfully");
      }
      handleClose();
      fetchTaxes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tax entry?")) {
      try {
        const resDel = await api.delete(`api/taxes/${id}`);
        if(!resDel) return;
        toast.success("Tax deleted successfully");
        fetchTaxes();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Taxes</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Tax Value</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taxes.length > 0 ? (
              taxes.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.tax_value}</TableCell>
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
                <TableCell colSpan={3} align="center">No Taxes Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Tax" : "Add Tax"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Tax Value (%)"
            type="number"
            fullWidth
            variant="outlined"
            value={taxValue}
            onChange={(e) => setTaxValue(e.target.value)}
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
