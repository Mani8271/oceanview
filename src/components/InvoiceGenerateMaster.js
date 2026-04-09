import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  FormControl, InputLabel, Select, MenuItem 
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function InvoiceGenerateMaster() {
  const [invoiceStatuses, setInvoiceStatuses] = useState([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("YES");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchInvoiceStatuses();
  }, []);

  const fetchInvoiceStatuses = async () => {
    try {
      const res = await api.get("api/invoice-generates");
      if (res && res.data) {
        setInvoiceStatuses(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setStatus(item.status || "YES");
    } else {
      setEditId(null);
      setStatus("YES");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setStatus("YES");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    try {
      if (editId) {
        const resPut = await api.put(`api/invoice-generates/${editId}`, { status });
        if(!resPut) return;
        toast.success("Invoice Generate status updated successfully");
      } else {
        const resPost = await api.post("api/invoice-generates", { status });
        if(!resPost) return;
        toast.success("Invoice Generate status added successfully");
      }
      handleClose();
      fetchInvoiceStatuses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this status?")) {
      try {
        const resDel = await api.delete(`api/invoice-generates/${id}`);
        if(!resDel) return;
        toast.success("Deleted successfully");
        fetchInvoiceStatuses();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Invoice Generate Statuses</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceStatuses.length > 0 ? (
              invoiceStatuses.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.status}</TableCell>
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
                <TableCell colSpan={3} align="center">No Records Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Invoice Generate Status" : "Add Invoice Generate Status"}</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="YES">YES</MenuItem>
              <MenuItem value="NO">NO</MenuItem>
            </Select>
          </FormControl>
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
