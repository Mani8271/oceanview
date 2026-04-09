import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function PersonCountsMaster() {
  const [personCounts, setPersonCounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [numberOfPersons, setNumberOfPersons] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchPersonCounts();
  }, []);

  const fetchPersonCounts = async () => {
    try {
      const res = await api.get("api/person-counts");
      if (res && res.data) {
        setPersonCounts(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (countItem = null) => {
    if (countItem) {
      setEditId(countItem.id);
      setNumberOfPersons(countItem.number_of_persons);
    } else {
      setEditId(null);
      setNumberOfPersons("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNumberOfPersons("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (numberOfPersons === "" || numberOfPersons === null) {
      toast.error("Number of Persons is required");
      return;
    }

    const payload = { number_of_persons: Number(numberOfPersons) };

    try {
      if (editId) {
        const resPut = await api.put(`api/person-counts/${editId}`, payload);
        if(!resPut) return;
        toast.success("Person Count updated successfully");
      } else {
        const resPost = await api.post("api/person-counts", payload);
        if(!resPost) return;
        toast.success("Person Count added successfully");
      }
      handleClose();
      fetchPersonCounts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this person count?")) {
      try {
        const resDel = await api.delete(`api/person-counts/${id}`);
        if(!resDel) return;
        toast.success("Person Count deleted successfully");
        fetchPersonCounts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Person Counts</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Number of Persons</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {personCounts.length > 0 ? (
              personCounts.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.number_of_persons}</TableCell>
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
                <TableCell colSpan={3} align="center">No Person Counts Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Person Count" : "Add Person Count"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Number of Persons"
            type="number"
            fullWidth
            variant="outlined"
            value={numberOfPersons}
            onChange={(e) => setNumberOfPersons(e.target.value)}
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
