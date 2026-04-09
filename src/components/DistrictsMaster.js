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

export default function DistrictsMaster() {
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const res = await api.get("api/states");
      const stateList = res?.data?.data || res?.data || [];
      setStates(stateList);
      if (stateList.length > 0) {
        setSelectedStateId(stateList[0].id);
        fetchDistricts(stateList[0].id);
      }
    } catch (e) { console.error(e); }
  };

  const fetchDistricts = async (stateId = selectedStateId, search = searchQuery) => {
    if (!stateId) return;
    setLoading(true);
    try {
      // Use the pattern from the screenshot: api/districts?state_id=...&search=...
      const res = await api.get(`api/districts?state_id=${stateId}&search=${search}`);
      if (res && res.data) {
        setDistricts(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
      setDistricts([]);
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
    if (!name.trim() || !selectedStateId) {
      toast.error("District Name and State selection are required");
      return;
    }

    setLoading(true);
    const payload = {
        name: name.toUpperCase(),
        state_id: selectedStateId
    };

    try {
      if (editId) {
        await api.put(`api/districts/${editId}`, payload);
        toast.success("District updated successfully");
      } else {
        await api.post("api/districts", payload);
        toast.success("District added successfully");
      }
      handleClose();
      fetchDistricts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this district?")) {
      setLoading(true);
      try {
        await api.delete(`api/districts/${id}`);
        toast.success("District deleted successfully");
        fetchDistricts();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete district");
        setLoading(false);
      }
    }
  };

  const handleStateChange = (e) => {
    const val = e.target.value;
    setSelectedStateId(val);
    fetchDistricts(val, searchQuery);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchDistricts(selectedStateId, val);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight="bold">Districts Management</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ 
                minWidth: 180,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3a4a6b' },
                '& .MuiInputLabel-root': { color: '#8899bb' },
                '& .MuiSelect-select': { color: '#fff', bgcolor: '#1a2035' }
            }}>
              <InputLabel>Select State</InputLabel>
              <Select value={selectedStateId} label="Select State" onChange={handleStateChange}>
                {states.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField 
                size="small" placeholder="Search District..." 
                value={searchQuery} onChange={handleSearchChange}
                InputProps={{ startAdornment: <Search sx={{ color: '#8899bb', mr: 1, fontSize: '18px' }} /> }}
                sx={{ ...darkField, width: '220px' }}
            />
            <Button variant="contained" onClick={() => handleOpen()} color="primary" startIcon={<Add />}>
                Add District
            </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1a2035', color: '#fff', borderRadius: '12px', border: '1px solid #253050' }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0d1321" }}>
            <TableRow>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>District Name</TableCell>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>State ID</TableCell>
              <TableCell align="right" sx={{ color: '#8899bb', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && districts.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : districts.length > 0 ? (
              districts.map((row) => (
                <TableRow key={row.id} sx={{ '& td': { color: '#e0e6f0', borderBottom: '1px solid #253050' } }}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: '500' }}>{row.name}</TableCell>
                  <TableCell><Box sx={{ bgcolor: '#0e1729', px: 1, py: 0.5, borderRadius: '4px', display: 'inline-block', fontSize: '12px' }}>ID: {row.state_id}</Box></TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(row)} color="primary" sx={{ mr: 1 }} size="small"><Edit fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleDelete(row.id)} color="error" size="small"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5, color: '#8899bb' }}>No Districts Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: '#0e1729', color: '#fff' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #253050' }}>{editId ? "Edit District" : "Add New District"}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            margin="dense" label="District Name" fullWidth variant="outlined"
            value={name} onChange={(e) => setName(e.target.value.toUpperCase())}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#3a4a6b' } } }}
            InputLabelProps={{ sx: { color: '#8899bb' } }}
          />
          <Typography variant="caption" sx={{ color: '#8899bb' }}>Adding to State: <b>{states.find(s=>s.id === selectedStateId)?.name}</b></Typography>
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
