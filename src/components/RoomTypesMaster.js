import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function RoomTypesMaster() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const res = await api.get("api/room-types");
      if (res && res.data) {
        setRoomTypes(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (type = null) => {
    if (type) {
      setEditId(type.id);
      setTypeName(type.type_name);
    } else {
      setEditId(null);
      setTypeName("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTypeName("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!typeName.trim()) {
      toast.error("Type Name is required");
      return;
    }

    try {
      if (editId) {
        const resPut = await api.put(`api/room-types/${editId}`, { type_name: typeName });
        if(!resPut) return;
        toast.success("Room Type updated successfully");
      } else {
        const resPost = await api.post("api/room-types", { type_name: typeName });
        if(!resPost) return;
        toast.success("Room Type added successfully");
      }
      handleClose();
      fetchRoomTypes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this room type?")) {
      try {
        const resDel = await api.delete(`api/room-types/${id}`);
        if(!resDel) return;
        toast.success("Room Type deleted successfully");
        fetchRoomTypes();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Room Types</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Type Name</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomTypes.length > 0 ? (
              roomTypes.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.type_name}</TableCell>
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
                <TableCell colSpan={3} align="center">No Room Types Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Room Type" : "Add Room Type"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Room Type Name"
            type="text"
            fullWidth
            variant="outlined"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
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
