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

export default function BookingIdCodesMaster() {
  const [codes, setCodes] = useState([]);
  const [open, setOpen] = useState(false);
  const [codeName, setCodeName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const res = await api.get("api/booking-id-codes");
      if (res && res.data) {
        setCodes(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setCodeName(item.code || "");
      setIsActive(Boolean(item.is_active));
    } else {
      setEditId(null);
      setCodeName("");
      setIsActive(true);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCodeName("");
    setIsActive(true);
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!codeName.trim()) {
      toast.error("Code is required");
      return;
    }

    const payload = { 
      code: codeName,
      is_active: isActive
    };

    try {
      if (editId) {
        const resPut = await api.put(`api/booking-id-codes/${editId}`, payload);
        if(!resPut) return;
        toast.success("Booking ID Code updated successfully");
      } else {
        const resPost = await api.post("api/booking-id-codes", payload);
        if(!resPost) return;
        toast.success("Booking ID Code added successfully");
      }
      handleClose();
      fetchCodes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this code?")) {
      try {
        const resDel = await api.delete(`api/booking-id-codes/${id}`);
        if(!resDel) return;
        toast.success("Booking ID Code deleted successfully");
        fetchCodes();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Booking ID Codes</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Code</b></TableCell>
              <TableCell><b>Is Active?</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {codes.length > 0 ? (
              codes.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.code}</TableCell>
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
                <TableCell colSpan={4} align="center">No Booking ID Codes Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Booking ID Code" : "Add Booking ID Code"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Code (e.g., WLK-)"
                type="text"
                fullWidth
                variant="outlined"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
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
