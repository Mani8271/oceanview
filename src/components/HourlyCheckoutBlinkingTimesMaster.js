import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControlLabel, Checkbox
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function HourlyCheckoutBlinkingTimesMaster() {
  const [times, setTimes] = useState([]);
  const [open, setOpen] = useState(false);
  
  const [blinkingMinutes, setBlinkingMinutes] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchTimes();
  }, []);

  const fetchTimes = async () => {
    try {
      const res = await api.get("api/hourly-checkout-blinking-times");
      if (res && res.data) {
        setTimes(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (time = null) => {
    if (time) {
      setEditId(time.id);
      setBlinkingMinutes(time.blinking_minutes);
      setIsActive(Boolean(time.is_active));
    } else {
      setEditId(null);
      setBlinkingMinutes("");
      setIsActive(true);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setBlinkingMinutes("");
    setIsActive(true);
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (blinkingMinutes === "" || blinkingMinutes === null) {
      toast.error("Blinking minutes is required");
      return;
    }

    const payload = { 
      blinking_minutes: Number(blinkingMinutes),
      is_active: isActive
    };

    try {
      if (editId) {
        const resPut = await api.put(`api/hourly-checkout-blinking-times/${editId}`, payload);
        if(!resPut) return;
        toast.success("Updated successfully");
      } else {
        const resPost = await api.post("api/hourly-checkout-blinking-times", payload);
        if(!resPost) return;
        toast.success("Added successfully");
      }
      handleClose();
      fetchTimes();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save data");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this setting?")) {
      try {
        const resDel = await api.delete(`api/hourly-checkout-blinking-times/${id}`);
        if(!resDel) return;
        toast.success("Deleted successfully");
        fetchTimes();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Hourly Checkout Blinking Times</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Blinking Minutes</b></TableCell>
              <TableCell><b>Active</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {times.length > 0 ? (
              times.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.blinking_minutes} mins</TableCell>
                  <TableCell>{row.is_active ? "Yes" : "No"}</TableCell>
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
                <TableCell colSpan={4} align="center">No Records Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Setting" : "Add Setting"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Blinking Minutes"
            type="number"
            fullWidth
            variant="outlined"
            value={blinkingMinutes}
            onChange={(e) => setBlinkingMinutes(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)} 
                color="primary" 
              />
            }
            label="Is Active"
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
