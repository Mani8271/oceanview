import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, CircularProgress, Select, MenuItem, FormControl, InputLabel
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

export default function StatesMaster() {
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await api.get("api/countries");
      const countryList = res?.data?.data || res?.data || [];
      setCountries(countryList);
      if (countryList.length > 0) {
        setSelectedCountryId(countryList[0].id);
        fetchStates(countryList[0].id);
      }
    } catch (e) { console.error(e); }
  };

  const fetchStates = async (countryId = selectedCountryId, search = searchQuery) => {
    if (!countryId) return;
    setLoading(true);
    try {
      const res = await api.get(`api/states?country_id=${countryId}&search=${search}`);
      if (res && res.data) {
        setStates(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setName(item.name || "");
    } else {
      setEditId(null);
      setName("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !selectedCountryId) {
      toast.error("State Name and Country selection are required");
      return;
    }

    setLoading(true);
    const payload = {
        name: name.toUpperCase(),
        country_id: selectedCountryId
    };

    try {
      if (editId) {
        await api.put(`api/states/${editId}`, payload);
        toast.success("State updated successfully");
      } else {
        await api.post("api/states", payload);
        toast.success("State added successfully");
      }
      handleClose();
      fetchStates();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this state?")) {
      setLoading(true);
      try {
        await api.delete(`api/states/${id}`);
        toast.success("State deleted successfully");
        fetchStates();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete state");
        setLoading(false);
      }
    }
  };

  const handleCountryChange = (e) => {
    const val = e.target.value;
    setSelectedCountryId(val);
    fetchStates(val, searchQuery);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchStates(selectedCountryId, val);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight="bold">States Management</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ 
                minWidth: 180,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3a4a6b' },
                '& .MuiInputLabel-root': { color: '#8899bb' },
                '& .MuiSelect-select': { color: '#fff', bgcolor: '#1a2035' }
            }}>
              <InputLabel>Select Country</InputLabel>
              <Select value={selectedCountryId} label="Select Country" onChange={handleCountryChange}>
                {countries.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField 
                size="small" placeholder="Search State..." 
                value={searchQuery} onChange={handleSearchChange}
                InputProps={{ startAdornment: <Search sx={{ color: '#8899bb', mr: 1, fontSize: '18px' }} /> }}
                sx={{ ...darkField, width: '220px' }}
            />
            <Button variant="contained" onClick={() => handleOpen()} color="primary" startIcon={<Add />}>
                Add State
            </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1a2035', color: '#fff', borderRadius: '12px', border: '1px solid #253050' }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0d1321" }}>
            <TableRow>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>State Name</TableCell>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>Country ID</TableCell>
              <TableCell align="right" sx={{ color: '#8899bb', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && states.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : states.length > 0 ? (
              states.map((row) => (
                <TableRow key={row.id} sx={{ '& td': { color: '#e0e6f0', borderBottom: '1px solid #253050' } }}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: '500' }}>{row.name}</TableCell>
                  <TableCell><Box sx={{ bgcolor: '#0e1729', px: 1, py: 0.5, borderRadius: '4px', display: 'inline-block', fontSize: '12px' }}>ID: {row.country_id}</Box></TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(row)} color="primary" sx={{ mr: 1 }} size="small"><Edit fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleDelete(row.id)} color="error" size="small"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5, color: '#8899bb' }}>No States Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: '#0e1729', color: '#fff' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #253050' }}>{editId ? "Edit State" : "Add New State"}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            margin="dense" label="State Name" fullWidth variant="outlined"
            value={name} onChange={(e) => setName(e.target.value.toUpperCase())}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#3a4a6b' } } }}
            InputLabelProps={{ sx: { color: '#8899bb' } }}
          />
          <Typography variant="caption" sx={{ color: '#8899bb' }}>Adding to Country: <b>{countries.find(c=>c.id === selectedCountryId)?.name}</b></Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #253050' }}>
          <Button onClick={handleClose} sx={{ color: '#8899bb' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? "Processing..." : (editId ? "Update" : "Save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
