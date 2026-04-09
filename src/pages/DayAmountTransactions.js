import React, { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function DayAmountTransactions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [selectedDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
      const res = await api.get(`api/day-amount-transactions?date=${dateStr}`);
      setData(res?.data?.data || res?.data || []);
    } catch (e) {
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditData({ ...item });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editData) return;
    try {
      await api.put(`api/day-amount-transactions/${editData.id}`, editData);
      toast.success("Transaction updated successfully");
      setEditOpen(false);
      fetchTransactions();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const columnStyles = {
    color: '#8faac8',
    fontWeight: 'bold',
    fontSize: '11px',
    textTransform: 'uppercase',
    borderBottom: '1px solid #253050',
    py: 1.5,
    bgcolor: '#0d1321'
  };

  const cellStyles = {
    color: '#e0e6f0',
    fontSize: '11px',
    borderBottom: '1px solid #1e2d45',
    py: 1.2
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#111C31", minHeight: "100vh" }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#0e1729', p: 2, borderRadius: '8px', border: '1px solid #253050' }}>
        <Typography variant="h5" sx={{ color: '#4B90FC', fontWeight: 'bold' }}>
          Day Amount Transactions Report
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ color: '#8faac8', fontSize: '13px', fontWeight: 'bold' }}>Filter Date:</Typography>
          <Box className="custom-datepicker">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd-MM-yyyy"
              customInput={
                <TextField
                  size="small"
                  sx={{
                    bgcolor: '#1a2035',
                    '& .MuiOutlinedInput-root': {
                      color: '#e0e6f0',
                      fontSize: '13px',
                      height: '35px',
                      '& fieldset': { borderColor: '#3a4a6b' },
                      '&:hover fieldset': { borderColor: '#4B90FC' },
                    }
                  }}
                />
              }
            />
          </Box>
          <Button 
            variant="contained" 
            onClick={fetchTransactions}
            sx={{ bgcolor: '#4B90FC', fontWeight: 'bold', fontSize: '12px' }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#0e1729', borderRadius: '8px', border: '1px solid #253050', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={columnStyles}>S.No</TableCell>
              <TableCell sx={columnStyles}>Room No</TableCell>
              <TableCell sx={columnStyles}>Company Name</TableCell>
              <TableCell sx={columnStyles}>Guest Name</TableCell>
              <TableCell sx={columnStyles}>Payment Type</TableCell>
              <TableCell sx={columnStyles}>Cash</TableCell>
              <TableCell sx={columnStyles}>UPI</TableCell>
              <TableCell sx={columnStyles}>Card</TableCell>
              <TableCell sx={columnStyles}>Credit</TableCell>
              <TableCell sx={columnStyles}>Cheque</TableCell>
              <TableCell sx={columnStyles}>User Name</TableCell>
              <TableCell sx={columnStyles}>Trans..Time</TableCell>
              <TableCell sx={columnStyles}>Receipt No</TableCell>
              <TableCell sx={columnStyles} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={14} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={14} align="center" sx={{ py: 5, color: '#8899bb' }}>No transactions found for this date</TableCell></TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#1a2a4a' } }}>
                  <TableCell sx={cellStyles}>{index + 1}</TableCell>
                  <TableCell sx={cellStyles}>{item.room_number}</TableCell>
                  <TableCell sx={cellStyles}>{item.company_name}</TableCell>
                  <TableCell sx={cellStyles}>{item.guest_name}</TableCell>
                  <TableCell sx={{ ...cellStyles, color: '#4B90FC', fontWeight: 'bold' }}>{item.payment_type}</TableCell>
                  <TableCell sx={{ ...cellStyles, color: '#16a34a', fontWeight: 'bold' }}>{item.cash}</TableCell>
                  <TableCell sx={{ ...cellStyles, color: '#16a34a', fontWeight: 'bold' }}>{item.upi}</TableCell>
                  <TableCell sx={cellStyles}>{item.card}</TableCell>
                  <TableCell sx={cellStyles}>{item.credit}</TableCell>
                  <TableCell sx={cellStyles}>{item.cheque}</TableCell>
                  <TableCell sx={cellStyles}>{item.user_name}</TableCell>
                  <TableCell sx={cellStyles}>
                    {dayjs(item.date).format("DD-MM-YYYY")} <br/>
                    <small style={{ color: '#8899bb' }}>{item.time}</small>
                  </TableCell>
                  <TableCell sx={cellStyles}>{item.receipt_no}</TableCell>
                  <TableCell sx={cellStyles} align="center">
                    <IconButton size="small" onClick={() => handleEditClick(item)} sx={{ color: '#4B90FC' }}>
                      <span style={{ fontSize: "14px" }}>✎</span>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={() => setEditOpen(false)}
        PaperProps={{ sx: { bgcolor: '#0e1729', color: '#e0e6f0', minWidth: '500px', border: '1px solid #253050' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #253050', color: '#4B90FC', fontWeight: 'bold' }}>
          Update Transaction
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {[
              { label: 'Room Number', field: 'room_number' },
              { label: 'Guest Name', field: 'guest_name' },
              { label: 'Company Name', field: 'company_name' },
              { label: 'Receipt No', field: 'receipt_no' },
              { label: 'Cash', field: 'cash' },
              { label: 'UPI', field: 'upi' },
              { label: 'Card', field: 'card' },
              { label: 'Credit', field: 'credit' },
              { label: 'Cheque', field: 'cheque' },
            ].map(f => (
              <Grid item xs={6} key={f.field}>
                <Typography sx={{ color: '#8faac8', fontSize: '10px', fontWeight: 'bold', mb: 0.5, textTransform: 'uppercase' }}>
                  {f.label}
                </Typography>
                <TextField
                  fullWidth size="small"
                  value={editData?.[f.field] || ""}
                  onChange={(e) => handleChange(f.field, e.target.value)}
                  sx={{
                    bgcolor: '#1a2035',
                    '& .MuiOutlinedInput-root': {
                      color: '#e0e6f0',
                      fontSize: '12px',
                      '& fieldset': { borderColor: '#3a4a6b' },
                      '&:hover fieldset': { borderColor: '#4B90FC' },
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #253050', p: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#8899bb' }}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" sx={{ bgcolor: '#4B90FC' }}>Update Amount</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
