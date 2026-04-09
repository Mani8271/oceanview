import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function PaymentModesMaster() {
  const [paymentModes, setPaymentModes] = useState([]);
  const [open, setOpen] = useState(false);
  const [modeName, setModeName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchPaymentModes();
  }, []);

  const fetchPaymentModes = async () => {
    try {
      const res = await api.get("api/payment-modes");
      if (res && res.data) {
        setPaymentModes(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (mode = null) => {
    if (mode) {
      setEditId(mode.id);
      setModeName(mode.mode_name);
    } else {
      setEditId(null);
      setModeName("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setModeName("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!modeName.trim()) {
      toast.error("Mode Name is required");
      return;
    }

    try {
      if (editId) {
        const resPut = await api.put(`api/payment-modes/${editId}`, { mode_name: modeName });
        if(!resPut) return;
        toast.success("Payment Mode updated successfully");
      } else {
        const resPost = await api.post("api/payment-modes", { mode_name: modeName });
        if(!resPost) return;
        toast.success("Payment Mode added successfully");
      }
      handleClose();
      fetchPaymentModes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment mode?")) {
      try {
        const resDel = await api.delete(`api/payment-modes/${id}`);
        if(!resDel) return;
        toast.success("Payment Mode deleted successfully");
        fetchPaymentModes();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Payment Modes</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Mode Name</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentModes.length > 0 ? (
              paymentModes.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.mode_name}</TableCell>
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
                <TableCell colSpan={3} align="center">No Payment Modes Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Payment Mode" : "Add Payment Mode"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Mode Name (e.g., UPI, Cash)"
            type="text"
            fullWidth
            variant="outlined"
            value={modeName}
            onChange={(e) => setModeName(e.target.value)}
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
