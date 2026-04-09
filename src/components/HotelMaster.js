import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Avatar, IconButton
} from "@mui/material";
import { Edit, Delete, PhotoCamera } from "@mui/icons-material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function HotelMaster() {
  const [hotels, setHotels] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await api.get("api/hotels");
      if (res && res.data) {
        setHotels(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch hotels");
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setName(item.name || "");
      setAddress(item.address || "");
      setLogoFile(null);
      setLogoPreview(item.logo ? getImageUrl(item.logo) : null);
    } else {
      setEditId(null);
      setName("");
      setAddress("");
      setLogoFile(null);
      setLogoPreview(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setAddress("");
    setLogoFile(null);
    setLogoPreview(null);
    setEditId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) {
      toast.error("Name and Address are required");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("address", address);
    if (logoFile) {
      formData.append("logo", logoFile);
    }
    
    formData.isMultipart = true;

    try {
      if (editId) {
        // Method spoofing for Laravel/Symphony backends that don't handle Multipart on PUT
        formData.append("_method", "PUT");
        await api.post(`api/hotels/${editId}`, formData);
        toast.success("Hotel updated successfully");
      } else {
        await api.post("api/hotels", formData);
        toast.success("Hotel added successfully");
      }
      handleClose();
      fetchHotels();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      try {
        await api.delete(`api/hotels/${id}`);
        toast.success("Hotel deleted successfully");
        fetchHotels();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete hotel");
      }
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = api.baseURL || "https://hotel.pminfotechsolutions.in/";
    const cleanPath = path.toString().replace(/^storage\//, "").replace(/^\//, "");
    return `${baseUrl.replace(/\/$/, "")}/storage/app/public/${cleanPath}`;
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Hotel Details Management</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary" startIcon={<PhotoCamera />}>
          Add New Hotel
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1a2035', color: '#fff' }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0d1321" }}>
            <TableRow>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>Logo</TableCell>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>Hotel Name</TableCell>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>Address</TableCell>
              <TableCell align="right" sx={{ color: '#8899bb', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hotels.length > 0 ? (
              hotels.map((row) => (
                <TableRow key={row.id} sx={{ '& td': { color: '#e0e6f0', borderBottom: '1px solid #253050' } }}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Avatar src={getImageUrl(row.logo)} alt={row.name} variant="rounded" sx={{ width: 50, height: 50, bgcolor: '#0e1729' }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                  <TableCell>{row.address}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(row)} color="primary" sx={{ mr: 1 }}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(row.id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#8899bb' }}>No Hotels Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: '#0e1729', color: '#fff' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #253050' }}>{editId ? "Edit Hotel Details" : "Add New Hotel"}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            margin="dense" label="Hotel Name" fullWidth variant="outlined"
            value={name} onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#3a4a6b' } } }}
            InputLabelProps={{ sx: { color: '#8899bb' } }}
          />
          <TextField
            margin="dense" label="Address" fullWidth variant="outlined" multiline rows={3}
            value={address} onChange={(e) => setAddress(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#3a4a6b' } } }}
            InputLabelProps={{ sx: { color: '#8899bb' } }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Button variant="outlined" component="label" startIcon={<PhotoCamera />} sx={{ color: '#4B90FC', borderColor: '#3a4a6b' }}>
              Upload Logo
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            {logoPreview && (
              <Avatar src={logoPreview} variant="rounded" sx={{ width: 60, height: 60, border: '1px solid #3a4a6b' }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #253050' }}>
          <Button onClick={handleClose} sx={{ color: '#8899bb' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? "Processing..." : (editId ? "Update Hotel" : "Save Hotel")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
