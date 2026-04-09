import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, CircularProgress, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

const darkField = {
    bgcolor: "#1a2035", borderRadius: '4px', border: '1px solid #3a4a6b',
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiOutlinedInput-root': { color: '#e0e6f0', height: '36px', fontSize: '13px', bgcolor: '#1a2035' },
    '& .MuiInputBase-input': { padding: '8px 12px' },
};

export default function IssueTypesMaster() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("api/issue-types");
      if (res && res.data) {
        setData(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch issue types");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id);
      setName(item.name || "");
      setStatus(item.status || "active");
    } else {
      setEditId(null);
      setName("");
      setStatus("active");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setStatus("active");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Issue Name is required");
      return;
    }

    setLoading(true);
    const payload = {
        name: name.toUpperCase(),
        status: status
    };

    try {
      if (editId) {
        await api.put(`api/issue-types/${editId}`, payload);
        toast.success("Issue Type updated successfully");
      } else {
        await api.post("api/issue-types", payload);
        toast.success("Issue Type added successfully");
      }
      handleClose();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this issue type?")) {
      setLoading(true);
      try {
        await api.delete(`api/issue-types/${id}`);
        toast.success("Issue Type deleted successfully");
        fetchData();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete issue type");
        setLoading(false);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Issue Types Management</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary" startIcon={<Add />}>
            Add Issue Type
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1a2035', color: '#fff', borderRadius: '12px', border: '1px solid #253050' }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0d1321" }}>
            <TableRow>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>Issue Name</TableCell>
              <TableCell sx={{ color: '#8899bb', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right" sx={{ color: '#8899bb', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && data.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : data.length > 0 ? (
                data.map((row) => (
                <TableRow key={row.id} sx={{ '& td': { color: '#e0e6f0', borderBottom: '1px solid #253050' } }}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: '500' }}>{row.name}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                        bgcolor: row.status === 'active' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(211, 47, 47, 0.1)', 
                        color: row.status === 'active' ? '#28a745' : '#ef4444',
                        px: 1, py: 0.2, borderRadius: '4px', display: 'inline-block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase'
                    }}>
                        {row.status}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(row)} color="primary" sx={{ mr: 1 }} size="small"><Edit fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleDelete(row.id)} color="error" size="small"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5, color: '#8899bb' }}>No Issue Types Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: '#0e1729', color: '#fff' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #253050' }}>{editId ? "Edit Issue Type" : "Add Issue Type"}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            margin="dense" label="Issue Name (e.g. AC GAS FILLING)" fullWidth variant="outlined"
            value={name} onChange={(e) => setName(e.target.value.toUpperCase())}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#3a4a6b' } } }}
            InputLabelProps={{ sx: { color: '#8899bb' } }}
          />
          <FormControl fullWidth size="small" sx={{ 
              mt: 1,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3a4a6b' },
              '& .MuiInputLabel-root': { color: '#8899bb' },
              '& .MuiSelect-select': { color: '#fff', bgcolor: '#1a2035' }
          }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="active">ACTIVE</MenuItem>
                <MenuItem value="inactive">INACTIVE</MenuItem>
            </Select>
          </FormControl>
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
