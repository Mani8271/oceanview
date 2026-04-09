import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function PaymentStatusesMaster() {
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [open, setOpen] = useState(false);
  const [statusName, setStatusName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchPaymentStatuses();
  }, []);

  const fetchPaymentStatuses = async () => {
    try {
      const res = await api.get("api/payment-statuses");
      if (res && res.data) {
        setPaymentStatuses(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (status = null) => {
    if (status) {
      setEditId(status.id);
      setStatusName(status.status_name);
    } else {
      setEditId(null);
      setStatusName("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setStatusName("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!statusName.trim()) {
      toast.error("Status Name is required");
      return;
    }

    try {
      if (editId) {
        const resPut = await api.put(`api/payment-statuses/${editId}`, { status_name: statusName });
        if(!resPut) return;
        toast.success("Payment Status updated successfully");
      } else {
        const resPost = await api.post("api/payment-statuses", { status_name: statusName });
        if(!resPost) return;
        toast.success("Payment Status added successfully");
      }
      handleClose();
      fetchPaymentStatuses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment status?")) {
      try {
        const resDel = await api.delete(`api/payment-statuses/${id}`);
        if(!resDel) return;
        toast.success("Payment Status deleted successfully");
        fetchPaymentStatuses();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Payment Statuses</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Status Name</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentStatuses.length > 0 ? (
              paymentStatuses.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.status_name}</TableCell>
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
                <TableCell colSpan={3} align="center">No Payment Statuses Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Payment Status" : "Add Payment Status"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Payment Status Name"
            type="text"
            fullWidth
            variant="outlined"
            value={statusName}
            onChange={(e) => setStatusName(e.target.value)}
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
