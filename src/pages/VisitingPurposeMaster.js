import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { toast } from "react-toastify";
import API from "../API/API";



const api = new API();



const darkField = {
  bgcolor: "#1a2035", borderRadius: '4px', border: '1px solid #3a4a6b',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiOutlinedInput-root': { color: '#e0e6f0', height: '36px', fontSize: '13px', bgcolor: '#1a2035' },
  '& .MuiInputBase-input': { padding: '8px 12px' },
};



export default function VisitingPurposeMaster() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchPurposes();
  }, []);

  const fetchPurposes = async () => {
    setLoading(true);
    try {
      const res = await api.get("api/visiting-purposes");
      setData(res?.data?.data || res?.data || []);
    } catch (e) {
      toast.error("Failed to fetch visiting purposes");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!inputValue.trim()) {
      toast.warn("Please enter a purpose");
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await api.put(`api/visiting-purposes/${editId}`, { visiting_purpose: inputValue.toUpperCase() });
        toast.success("Updated successfully");
      } else {
        await api.post("api/visiting-purposes", { visiting_purpose: inputValue.toUpperCase() });
        toast.success("Saved successfully");
      }
      setInputValue("");
      setEditId(null);
      fetchPurposes();
    } catch (e) {
      toast.error("Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setInputValue(item.visiting_purpose);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    setLoading(true);
    try {
      await api.delete(`api/visiting-purposes/${id}`);
      toast.success("Deleted successfully");
      fetchPurposes();
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#0e1729', minHeight: '100vh', color: '#e0e6f0' }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', bgcolor: '#111c31', p: 4, borderRadius: '12px', border: '1px solid #253050', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>
          📂 Visiting Purpose Master
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth size="small" placeholder="Enter Visiting Purpose (e.g. BUSINESS)"
            value={inputValue} onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            sx={darkField}
          />
          <Button
            onClick={handleSave} variant="contained" disabled={loading}
            startIcon={editId ? <Edit /> : <Add />}
            sx={{ bgcolor: editId ? '#4B90FC' : '#28a745', fontWeight: 'bold', px: 4, '&:hover': { bgcolor: editId ? '#3a7ae0' : '#218838' } }}
          >
            {editId ? "UPDATE" : "ADD"}
          </Button>
          {editId && (
            <Button onClick={() => { setEditId(null); setInputValue(""); }} variant="outlined" sx={{ color: '#8899bb', borderColor: '#3a4a6b', fontWeight: 'bold' }}>
              CANCEL
            </Button>
          )}
        </Box>

        <Box sx={{ bgcolor: '#0a1128', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e2d45' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a2a4a', '& th': { color: '#8899bb', fontWeight: 'bold', borderBottom: '1px solid #253050', py: 1.5 } }}>
                <TableCell width="15%" align="center">ID</TableCell>
                <TableCell>Visiting Purpose</TableCell>
                <TableCell width="20%" align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && data.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: '#576478' }}>No records found</TableCell></TableRow>
              ) : data.map((item) => (
                <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#1a2035' }, '& td': { borderBottom: '1px solid #1e2d45', color: '#e0e6f0', py: 1 } }}>
                  <TableCell align="center">{item.id}</TableCell>
                  <TableCell sx={{ fontWeight: '500' }}>{item.visiting_purpose}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEdit(item)} sx={{ color: '#4B90FC', mr: 1 }}><Edit fontSize="inherit" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: '#ef4444' }}><Delete fontSize="inherit" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}
