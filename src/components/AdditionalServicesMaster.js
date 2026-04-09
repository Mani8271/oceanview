import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function AdditionalServicesMaster() {
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [amount, setAmount] = useState("");
  const [calculationType, setCalculationType] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get("api/additional-services");
      if (res && res.data) {
        setServices(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setServiceName(item.service_name || "");
      setAmount(item.amount || "");
      setCalculationType(item.calculation_type || "");
    } else {
      setEditId(null);
      setServiceName("");
      setAmount("");
      setCalculationType("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setServiceName("");
    setAmount("");
    setCalculationType("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!serviceName.trim() || amount === "" || amount === null) {
      toast.error("Service Name and Amount are required");
      return;
    }

    const payload = { 
      service_name: serviceName,
      amount: Number(amount),
      calculation_type: calculationType
    };

    try {
      if (editId) {
        const resPut = await api.put(`api/additional-services/${editId}`, payload);
        if(!resPut) return;
        toast.success("Additional Service updated successfully");
      } else {
        const resPost = await api.post("api/additional-services", payload);
        if(!resPost) return;
        toast.success("Additional Service added successfully");
      }
      handleClose();
      fetchServices();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const resDel = await api.delete(`api/additional-services/${id}`);
        if(!resDel) return;
        toast.success("Service deleted successfully");
        fetchServices();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Additional Services</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Service Name</b></TableCell>
              <TableCell><b>Amount</b></TableCell>
              <TableCell><b>Calculation Type</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length > 0 ? (
              services.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.service_name}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.calculation_type || "-"}</TableCell>
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
                <TableCell colSpan={5} align="center">No Additional Services Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Additional Service" : "Add Additional Service"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Service Name (e.g., Extra AC)"
                type="text"
                fullWidth
                variant="outlined"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                variant="outlined"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Calculation Type</InputLabel>
                <Select
                  value={calculationType || ""}
                  onChange={(e) => setCalculationType(e.target.value)}
                  label="Calculation Type"
                >
                  <MenuItem value="Calculate Per Night">Calculate Per Night</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                </Select>
              </FormControl>
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
