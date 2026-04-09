import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function RoomsMaster() {
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get("api/rooms");
      if (res && res.data) {
        setRooms(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (room = null) => {
    if (room) {
      setEditId(room.id);
      setRoomNumber(room.room_number);
    } else {
      setEditId(null);
      setRoomNumber("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRoomNumber("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!roomNumber.trim()) {
      toast.error("Room Number is required");
      return;
    }

    const payload = { room_number: roomNumber };

    try {
      if (editId) {
        const resPut = await api.put(`api/rooms/${editId}`, payload);
        if(!resPut) return;
        toast.success("Room updated successfully");
      } else {
        const resPost = await api.post("api/rooms", payload);
        if(!resPost) return;
        toast.success("Room added successfully");
      }
      handleClose();
      fetchRooms();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const resDel = await api.delete(`api/rooms/${id}`);
        if(!resDel) return;
        toast.success("Room deleted successfully");
        fetchRooms();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Rooms</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Room Number</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.length > 0 ? (
              rooms.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.room_number}</TableCell>
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
                <TableCell colSpan={3} align="center">No Rooms Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Room" : "Add Room"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Room Number"
            type="text"
            fullWidth
            variant="outlined"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
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
