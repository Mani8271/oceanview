import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Avatar, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function RoomStatusIconsMaster() {
  const [icons, setIcons] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchIcons();
    fetchStatusOptions();
  }, []);

  const fetchStatusOptions = async () => {
    try {
      const res = await api.get("api/room-status-options");
      if (res && res.data) {
        setStatusOptions(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchIcons = async () => {
    try {
      const res = await api.get("api/room-status-icons");
      if (res && res.data) {
        setIcons(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setName(item.name || "");
      setColor(item.color || "");
      setIconFile(null); // Keep null initially so users only upload if they want to replace it
    } else {
      setEditId(null);
      setName("");
      setColor("");
      setIconFile(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setColor("");
    setIconFile(null);
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!editId && !iconFile && !color.trim()) {
      toast.error("Either an Icon or a Color Code is mandatory");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("color", color);
    if (iconFile) {
      formData.append("icon", iconFile);
    }
    
    // Add this magical property so your API.js correctly forces multipart headers
    formData.isMultipart = true;

    try {
      if (editId) {
        // Laravel blocks FormData via PUT natively, so we must POST with _method=PUT!
        formData.append("_method", "PUT");
        const resPut = await api.post(`api/room-status-icons/${editId}`, formData);
        if(!resPut) return;
        toast.success("Room Status Icon updated successfully");
      } else {
        const resPost = await api.post("api/room-status-icons", formData);
        if(!resPost) return;
        toast.success("Room Status Icon added successfully");
      }
      handleClose();
      fetchIcons();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this status icon?")) {
      try {
        const resDel = await api.delete(`api/room-status-icons/${id}`);
        if(!resDel) return;
        toast.success("Room Status Icon deleted successfully");
        fetchIcons();
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Helper function to build correct image URL. (Ensure your BASE_URL properly points to public storage)
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = api.baseURL || "https://hotel.pminfotechsolutions.in/";
    const cleanPath = path.replace(/^storage\//, "").replace(/^\//, "");
    
    // The user confirmed this specific path structure works:
    return `${baseUrl.replace(/\/$/, "")}/storage/app/public/${cleanPath}`;
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Room Status Icons</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Color</b></TableCell>
              <TableCell><b>Icon</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {icons.length > 0 ? (
              icons.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 20, height: 20, bgcolor: row.color, border: '1px solid #ccc', borderRadius: '50%' }} />
                      {row.color}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {row.icon ? (
                      <Avatar src={getImageUrl(row.icon)} alt={row.name} variant="rounded" />
                    ) : (
                      "No Icon"
                    )}
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
                <TableCell colSpan={5} align="center">No Room Status Icons Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Room Status Icon" : "Add Room Status Icon"}</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="status-name-label">Status Name</InputLabel>
            <Select
              labelId="status-name-label"
              value={name}
              onChange={(e) => setName(e.target.value)}
              label="Status Name"
            >
              <MenuItem value=""><em>-- Select Status --</em></MenuItem>
              {statusOptions.map(opt => (
                <MenuItem key={opt.id} value={opt.name}>{opt.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
              margin="dense"
              label="Color Code (e.g., #FF0000)"
              type="text"
              fullWidth
              variant="outlined"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#FFFFFF"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <Box 
                    sx={{ 
                      width: 20, height: 20, mr: 1, 
                      bgcolor: color, border: '1px solid #ccc',
                      borderRadius: '4px'
                    }} 
                  />
                )
              }}
          />

          <Button
            variant="contained"
            component="label"
            fullWidth
            color="secondary"
          >
            Upload Icon Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setIconFile(e.target.files[0])}
            />
          </Button>
          {iconFile && (
            <Typography variant="body2" sx={{ mt: 1, color: "green" }}>
              Selected File: {iconFile.name}
            </Typography>
          )}
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
