import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function OtaCommissionStructuresMaster() {
  const [structures, setStructures] = useState([]);
  const [open, setOpen] = useState(false);
  const [commissionName, setCommissionName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchStructures();
  }, []);

  const fetchStructures = async () => {
    try {
      const res = await api.get("api/ota-commission-structures");
      if (res && res.data) {
        setStructures(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setCommissionName(item.name || "");
    } else {
      setEditId(null);
      setCommissionName("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCommissionName("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!commissionName.trim()) {
      toast.error("Commission Name is required");
      return;
    }

    // Creating payload matching exactly to {"name": "Commission", "value": 10}
    const payload = { 
      name: commissionName,
    };

    try {
      if (editId) {
        const resPut = await api.put(`api/ota-commission-structures/${editId}`, payload);
        if(!resPut) return;
        toast.success("OTA Commission Structure updated successfully");
      } else {
        const resPost = await api.post("api/ota-commission-structures", payload);
        if(!resPost) return;
        toast.success("OTA Commission Structure added successfully");
      }
      handleClose();
      fetchStructures();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this OTA commission structure?")) {
      try {
        const resDel = await api.delete(`api/ota-commission-structures/${id}`);
        if(!resDel) return;
        toast.success("Structure deleted successfully");
        fetchStructures();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">OTA Commission Structures</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Commission Name</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {structures.length > 0 ? (
              structures.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name || "-"}</TableCell>
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
                <TableCell colSpan={4} align="center">No OTA Commission Structures Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Structure" : "Add Structure"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Commission Name (e.g., Commission)"
                type="text"
                fullWidth
                variant="outlined"
                value={commissionName}
                onChange={(e) => setCommissionName(e.target.value)}
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
