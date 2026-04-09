import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function CitizenshipsMaster() {
  const [citizenships, setCitizenships] = useState([]);
  const [open, setOpen] = useState(false);
  const [citizenshipName, setCitizenshipName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCitizenships();
  }, []);

  const fetchCitizenships = async () => {
    try {
      const res = await api.get("api/citizenships");
      if (res && res.data) {
        setCitizenships(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setCitizenshipName(item.citizenship);
    } else {
      setEditId(null);
      setCitizenshipName("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCitizenshipName("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!citizenshipName.trim()) {
      toast.error("Citizenship is required");
      return;
    }

    try {
      if (editId) {
        const resPut = await api.put(`api/citizenships/${editId}`, { citizenship: citizenshipName });
        if(!resPut) return;
        toast.success("Citizenship updated successfully");
      } else {
        const resPost = await api.post("api/citizenships", { citizenship: citizenshipName });
        if(!resPost) return;
        toast.success("Citizenship added successfully");
      }
      handleClose();
      fetchCitizenships();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this citizenship?")) {
      try {
        const resDel = await api.delete(`api/citizenships/${id}`);
        if(!resDel) return;
        toast.success("Citizenship deleted successfully");
        fetchCitizenships();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Citizenships</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Citizenship</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {citizenships.length > 0 ? (
              citizenships.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.citizenship}</TableCell>
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
                <TableCell colSpan={3} align="center">No Citizenships Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Citizenship" : "Add Citizenship"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Citizenship"
            type="text"
            fullWidth
            variant="outlined"
            value={citizenshipName}
            onChange={(e) => setCitizenshipName(e.target.value)}
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
