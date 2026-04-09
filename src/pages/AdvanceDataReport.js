import React, { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, TextField, Button
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function AdvanceDataReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchAdvanceData();
  }, [selectedDate]);

  const fetchAdvanceData = async () => {
    setLoading(true);
    try {
      const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
      // Assuming endpoint exists or matching the Day Transactions pattern
      const res = await api.get(`api/advances?date=${dateStr}`);
      setData(res?.data?.data || res?.data || []);
    } catch (e) {
      toast.error("Failed to fetch advance data");
    } finally {
      setLoading(false);
    }
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
        <Typography variant="h5" sx={{ color: '#7c3aed', fontWeight: 'bold' }}>
          Advance Payment Report
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ color: '#8faac8', fontSize: '13px', fontWeight: 'bold' }}>Select Date:</Typography>
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
                    }
                  }}
                />
              }
            />
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#0e1729', borderRadius: '8px', border: '1px solid #253050', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={columnStyles}>S.No</TableCell>
              <TableCell sx={columnStyles}>Guest Name</TableCell>
              <TableCell sx={columnStyles}>Company</TableCell>
              <TableCell sx={columnStyles}>Reservation ID</TableCell>
              <TableCell sx={columnStyles}>Pay Mode</TableCell>
              <TableCell sx={columnStyles}>Trans. Time</TableCell>
              <TableCell sx={columnStyles} align="right">Advance Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: '#8899bb' }}>No advance payments found for this date</TableCell></TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#1a2a4a' } }}>
                  <TableCell sx={cellStyles}>{index + 1}</TableCell>
                  <TableCell sx={cellStyles}>{item.reservation?.guest_name || 'N/A'}</TableCell>
                  <TableCell sx={cellStyles}>{item.reservation?.company_name || 'N/A'}</TableCell>
                  <TableCell sx={{ ...cellStyles, color: '#4B90FC', fontWeight: 'bold' }}>#{item.reservation_id}</TableCell>
                  <TableCell sx={{ ...cellStyles, color: '#16a34a', fontWeight: 'bold' }}>{item.pay_mode}</TableCell>
                  <TableCell sx={cellStyles}>
                    {dayjs(item.date).format("DD-MM-YYYY")} <small style={{ color: '#8faac8' }}>{item.time}</small>
                  </TableCell>
                  <TableCell align="right" sx={{ ...cellStyles, fontWeight: 'bold', color: '#fff' }}>₹{item.advance_amount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
