import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, CircularProgress
} from "@mui/material";
import { Edit, Delete, Add, Search } from "@mui/icons-material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

const darkField = {
    bgcolor: "#1a2035", borderRadius: '4px', border: '1px solid #3a4a6b',
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiOutlinedInput-root': { color: '#e0e6f0', height: '36px', fontSize: '13px', bgcolor: '#1a2035' },
    '& .MuiInputBase-input': { padding: '8px 12px' },
};

export default function CountriesMaster() {
  const [countries, setCountries] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async (search = "") => {
    setLoading(true);
    try {
      const url = search ? `api/countries?search=${search}` : "api/countries";
      const res = await api.get(url);
      if (res && res.data) {
        setCountries(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch countries");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setName(item.name || "");
      setCode(item.code || "");
    } else {
      setEditId(null);
      setName("");
      setCode("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setCode("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim()) {
      toast.error("Name and Code are required");
      return;
    }

    setLoading(true);
    const payload = {
        name: name.toUpperCase(),
        code: code.toUpperCase()
    };

    try {
      if (editId) {
        await api.put(`api/countries/${editId}`, payload);
        toast.success("Country updated successfully");
      } else {
        await api.post("api/countries", payload);
        toast.success("Country added successfully");
      }
      handleClose();
      fetchCountries();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this country?")) {
      setLoading(true);
      try {
        await api.delete(`api/countries/${id}`);
        toast.success("Country deleted successfully");
        fetchCountries();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete country");
        setLoading(false);
      }
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    // Debounce search
    const timer = setTimeout(() => {
        fetchCountries(val);
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Countries Management</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
                size="small" placeholder="Search Country..." 
                value={searchQuery} onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchCountries(e.target.value);
                }}
                InputProps={{ startAdornment: <Search sx={{ color: '#8899bb', mr: 1, fontSize: '18px' }} /> }}
                sx={{ ...darkField, width: '250px' }}
            />
            <Button variant="contained" onClick={() => handleOpen()} color="primary" startIcon={<Add />}>
                Add New Country
            </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1a2035', color: '#fff', borderRadius: '12px', border: '1px solid #253050' }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0d1321" }}>
            <TableRow>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold', borderBottom: '1px solid #253050' }}>ID</TableCell>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold', borderBottom: '1px solid #253050' }}>Country Code</TableCell>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold', borderBottom: '1px solid #253050' }}>Country Name</TableCell>
              <TableCell align="right" sx={{ color: '#8899bb', fontWeight: 'bold', borderBottom: '1px solid #253050' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && countries.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : countries.length > 0 ? (
              countries.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#1e2d45' }, '& td': { color: '#e0e6f0', borderBottom: '1px solid #253050' } }}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell><Box sx={{ bgcolor: '#0e1729', px: 1, py: 0.5, borderRadius: '4px', display: 'inline-block', fontWeight: 'bold', color: '#4B90FC' }}>{row.code}</Box></TableCell>
                  <TableCell sx={{ fontWeight: '500' }}>{row.name}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(row)} color="primary" sx={{ mr: 1 }} size="small"><Edit fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleDelete(row.id)} color="error" size="small"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5, color: '#8899bb' }}>No Countries Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: '#0e1729', color: '#fff', borderRadius: '12px' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #253050', fontWeight: '700' }}>{editId ? "Edit Country" : "Add New Country"}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            margin="dense" label="Country Name" fullWidth variant="outlined"
            value={name} onChange={(e) => setName(e.target.value.toUpperCase())}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#3a4a6b' } } }}
            InputLabelProps={{ sx: { color: '#8899bb' } }}
          />
          <TextField
            margin="dense" label="Country Code (e.g. US)" fullWidth variant="outlined"
            value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#3a4a6b' } } }}
            InputLabelProps={{ sx: { color: '#8899bb' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #253050' }}>
          <Button onClick={handleClose} sx={{ color: '#8899bb', fontWeight: '600' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading} sx={{ fontWeight: '700', borderRadius: '6px' }}>
            {loading ? "Processing..." : (editId ? "Update" : "Save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
