import React, { useState, useEffect } from "react";
import { 
  Box, Typography, TextField, Button, Select, MenuItem, CircularProgress, 
  Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../API/API";
import dayjs from "dayjs";

const api = new API();

const fieldStyle = {
  bgcolor: "#0e1729",
  borderRadius: '4px',
  border: '1px solid #3a4a6b',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiOutlinedInput-root': { color: '#e0e6f0', height: '32px', fontSize: '13px' },
  '& .MuiInputBase-input': { padding: '4px 8px', color: '#e0e6f0' },
  '& .MuiInputBase-input.Mui-disabled': { color: '#e0e6f0', WebkitTextFillColor: '#e0e6f0' },
  '& .MuiSelect-select': { padding: '4px 8px !important' },
  '& .MuiSvgIcon-root': { color: '#8899bb' },
};

const labelStyle = {
  color: '#8faac8',
  fontSize: '12px',
  fontWeight: '600',
  mb: 0.5,
  display: 'block',
  textTransform: 'uppercase'
};

const INITIAL_FORM = {
  reservation_id: "",
  room_number: "",
  guest_name: "",
  phone_no: "",
  company_name: "WALKIN",
  booking_type: "Multiple Day",
  total_gross_amt: 0,
  previous_advance_paid: 0,
  balance_amount: 0,
  present_paid: 0,
  remaining_amount: 0,
  date: dayjs().format("YYYY-MM-DD"),
  time: dayjs().format("HH:mm:ss"),
  advance_type: "Room Advance",
  user_name: "Srinu Admin",
  pay_mode: "CASH",
  bank: ""
};

export default function RoomAdvance() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetchingGuest, setFetchingGuest] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const u = JSON.parse(userStr);
            setFormData(prev => ({ ...prev, user_name: u.name || u.username || "Srinu Admin" }));
        } catch(e) {}
    }

    if (location.state?.room_number) {
      handleRoomSearch(location.state.room_number);
    }
  }, [location.state]);

  const handleRoomSearch = async (num) => {
    if (!num) return;
    setFetchingGuest(true);
    setFormData(prev => ({ ...prev, room_number: num }));
    try {
      const res = await api.get(`api/room-masters/current-guest?room_number=${num}`);
      const data = res?.data?.data || res?.data;
      if (data) {
        const gross = parseFloat(data.total_gross_amt || data.gross_amount || data.total_amount || 0);
        const adv = parseFloat(data.advance_amt || data.advance || data.advance_amount || 0);
        const phone = data.phone_no || data.mobile_no || data.phone_number || data.guest_phone_no || "";
        const cid = data.check_in_id || data.id;
        
        setFormData(prev => ({
          ...prev,
          reservation_id: data.reservation_id || data.id || "",
          guest_name: data.guest_name || data.check_in_guest_name || "",
          phone_no: phone,
          company_name: data.company_name || data.corporate_name || "WALKIN",
          booking_type: data.booking_type || "Multiple Day",
          total_gross_amt: gross,
          previous_advance_paid: adv,
          balance_amount: gross - adv,
          remaining_amount: gross - adv
        }));

        fetchHistory(data.reservation_id || data.id);

        // Second Step: Deep fetch recovery
        if (!phone && cid) {
           try {
              const fullRes = await api.get(`api/check-ins/${cid}`);
              const fullData = fullRes?.data?.data || fullRes?.data;
              if (fullData) {
                 setFormData(prev => ({
                   ...prev,
                   phone_no: fullData.guest_phone_no || fullData.mobile_no || fullData.phone_no || prev.phone_no,
                   company_name: fullData.company_name || prev.company_name
                 }));
              }
           } catch (err) {}
        }

      } else {
        toast.info("No active guest in Room " + num);
        setFormData({ ...INITIAL_FORM, room_number: num });
        setHistory([]);
      }
    } catch (e) {
      toast.error("Failed to find occupant");
    } finally {
      setFetchingGuest(false);
    }
  };

  const fetchHistory = async (resId) => {
      try {
          const res = await api.get(`api/advances?reservation_id=${resId}`);
          const list = res?.data?.data || res?.data || [];
          setHistory(Array.isArray(list) ? list : []);
      } catch (e) {
          console.error("Failed to fetch history", e);
      }
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setFormData(prev => ({
      ...prev,
      present_paid: row.advance_amount,
      advance_type: row.advance_type,
      pay_mode: row.pay_mode || "CASH",
      bank: row.bank || "",
      date: row.date,
      time: row.time,
      remaining_amount: parseFloat(prev.balance_amount) - parseFloat(row.advance_amount)
    }));
  };

  const handlePresentPaidChange = (val) => {
      const amount = parseFloat(val || 0);
      const balance = parseFloat(formData.balance_amount || 0);
      setFormData(prev => ({
          ...prev,
          present_paid: val,
          remaining_amount: balance - amount
      }));
  };

  const handleSave = async () => {
    if (!formData.reservation_id) {
       toast.error("Valid Reservation required. Search Room No."); return;
    }
    if (!formData.present_paid || parseFloat(formData.present_paid) <= 0) {
       toast.error("Please enter a valid Present Paid amount."); return;
    }

    setLoading(true);
    try {
      const payload = {
          reservation_id: formData.reservation_id,
          room_number: formData.room_number,
          guest_name: formData.guest_name,
          phone_no: formData.phone_no,
          company_name: formData.company_name,
          booking_type: formData.booking_type,
          total_gross_amt: formData.total_gross_amt,
          advance_amount: formData.present_paid,
          advance_type: formData.advance_type,
          user_name: formData.user_name,
          pay_mode: formData.pay_mode,
          bank: formData.bank,
          date: formData.date,
          time: formData.time
      };
      if (editId) {
        await api.put(`api/advances/${editId}`, payload);
        toast.success("Advance Payment Updated");
      } else {
        await api.post("api/advances", payload);
        toast.success("Advance Payment Added");
      }
      setEditId(null);
      setFormData(prev => ({ ...prev, present_paid: 0, remaining_amount: prev.balance_amount }));
      if (formData.room_number) handleRoomSearch(formData.room_number);
    } catch (e) {
      toast.error(e.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 50px)', bgcolor: '#0b1120', p: 3, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ width: '100%', maxWidth: 800, bgcolor: '#0e1729', borderRadius: '4px', overflow: 'hidden', border: '1px solid #3a4a6b', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <Box sx={{ bgcolor: '#b22222', px: 2, py: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Room Advance Page</Typography>
          <Button onClick={() => navigate("/room-master")} sx={{ color: '#fff', fontSize: '12px', bgcolor: 'rgba(0,0,0,0.4)', px: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>CLOSE</Button>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                
                <Box>
                  <Typography sx={labelStyle}>Room Number</Typography>
                  <TextField fullWidth size="small" value={formData.room_number} 
                    onChange={(e) => setFormData(prev => ({ ...prev, room_number: e.target.value.toUpperCase() }))}
                    onBlur={() => handleRoomSearch(formData.room_number)}
                    placeholder="Enter Room No"
                    sx={{ ...fieldStyle, '& .MuiInputBase-input': { color: '#ffaa00', fontWeight: 'bold' } }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Guest Name</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    value={formData.guest_name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, guest_name: e.target.value.toUpperCase() }))}
                    sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} 
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={labelStyle}>Phone No</Typography>
                    <Typography sx={{ color: '#ff4444', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>History</Typography>
                  </Box>
                  <TextField fullWidth size="small" value={formData.phone_no} 
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_no: e.target.value }))}
                    placeholder="Mobile No"
                    sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Company Name</Typography>
                  <TextField fullWidth size="small" value={formData.company_name} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Booking Type</Typography>
                  <TextField fullWidth size="small" value={formData.booking_type} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Receipt Date & Time</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField fullWidth size="small" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} sx={fieldStyle} />
                    <TextField fullWidth size="small" type="time" step="1" value={formData.time} onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))} sx={fieldStyle} />
                  </Box>
                </Box>

                <Box>
                  <Typography sx={labelStyle}>User By</Typography>
                  <TextField fullWidth size="small" value={formData.user_name} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

              </Box>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                
                <Box>
                  <Typography sx={labelStyle}>Total Gross Amount</Typography>
                  <TextField fullWidth size="small" type="number" value={formData.total_gross_amt} 
                    onChange={(e) => {
                      const gross = parseFloat(e.target.value || 0);
                      const adv = parseFloat(formData.previous_advance_paid || 0);
                      setFormData(prev => ({ ...prev, total_gross_amt: e.target.value, balance_amount: gross - adv, remaining_amount: gross - adv }));
                    }}
                    sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={labelStyle}>Previous Advance Paid</Typography>
                    <Typography sx={{ color: '#ff4444', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>History</Typography>
                  </Box>
                  <TextField fullWidth size="small" value={formData.previous_advance_paid} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Balance Amount</Typography>
                  <TextField fullWidth size="small" value={formData.balance_amount.toFixed(2)} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Present Paid</Typography>
                  <TextField fullWidth size="small" type="number" value={formData.present_paid} 
                    onChange={(e) => handlePresentPaidChange(e.target.value)} 
                    placeholder="Enter Paid Amount"
                    sx={{ ...fieldStyle, '& .MuiInputBase-input': { color: '#00ff00', fontWeight: 'bold' } }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Remaining Amount</Typography>
                  <TextField fullWidth size="small" value={formData.remaining_amount.toFixed(2)} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Advance Type</Typography>
                  <Select fullWidth size="small" value={formData.advance_type} onChange={(e) => setFormData(prev => ({ ...prev, advance_type: e.target.value }))} sx={fieldStyle}>
                    <MenuItem value="Room Advance">Room Advance</MenuItem>
                    <MenuItem value="Service Advance">Service Advance</MenuItem>
                    <MenuItem value="Party Advance">Party Advance</MenuItem>
                    <MenuItem value="Refund">Refund</MenuItem>
                  </Select>
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Payment Mode</Typography>
                  <Select fullWidth size="small" value={formData.pay_mode} onChange={(e) => setFormData(prev => ({ ...prev, pay_mode: e.target.value }))} sx={fieldStyle}>
                    <MenuItem value="CASH">CASH</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="CARD">CARD</MenuItem>
                    <MenuItem value="BANK TRANSFER">BANK TRANSFER</MenuItem>
                  </Select>
                </Box>

                {formData.pay_mode !== "CASH" && (
                    <Box>
                        <Typography sx={labelStyle}>Bank Name / Ref No</Typography>
                        <TextField fullWidth size="small" value={formData.bank} onChange={(e) => setFormData(prev => ({ ...prev, bank: e.target.value }))} sx={fieldStyle} />
                    </Box>
                )}

              </Box>
            </Grid>
          </Grid>

          {/* Buttons Section */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 3 }}>
             <Button 
                onClick={() => navigate("/room-master")} 
                sx={{ bgcolor: 'rgba(14,23,41,0.8)', color: '#fff', border: '1px solid #ef4444', px: 4, py: 0.5, fontWeight: 'bold', fontSize: '13px', '&:hover': { bgcolor: '#ef4444' } }}
             >
                CLOSE
             </Button>
             <Button 
                onClick={handleSave} 
                disabled={loading || fetchingGuest} 
                sx={{ bgcolor: 'rgba(14,23,41,0.8)', color: '#fff', border: '1px solid #10b981', px: 4, py: 0.5, fontWeight: 'bold', fontSize: '13px', '&:hover': { bgcolor: '#10b981' } }}
             >
                 {loading ? <CircularProgress size={20} color="inherit" /> : (editId ? "UPDATE" : "SAVE")}
             </Button>
          </Box>

          {/* History Table */}
          <Box sx={{ mt: 4 }}>
              <TableContainer sx={{ maxHeight: 200, bgcolor: '#0b1120', borderRadius: '4px', border: '1px solid #3a4a6b' }}>
                  <Table size="small" stickyHeader>
                      <TableHead>
                          <TableRow>
                              <TableCell sx={{ bgcolor: '#4B90FC', color: '#fff', fontSize: '11px', fontWeight: 'bold', py: 0.5 }}>Receipt</TableCell>
                              <TableCell sx={{ bgcolor: '#4B90FC', color: '#fff', fontSize: '11px', fontWeight: 'bold', py: 0.5 }}>Head of</TableCell>
                              <TableCell sx={{ bgcolor: '#4B90FC', color: '#fff', fontSize: '11px', fontWeight: 'bold', py: 0.5 }}>Mode of</TableCell>
                              <TableCell sx={{ bgcolor: '#4B90FC', color: '#fff', fontSize: '11px', fontWeight: 'bold', py: 0.5 }}>User</TableCell>
                              <TableCell sx={{ bgcolor: '#4B90FC', color: '#fff', fontSize: '11px', fontWeight: 'bold', py: 0.5 }} align="right">Amount</TableCell>
                              <TableCell sx={{ bgcolor: '#4B90FC', color: '#fff', fontSize: '11px', fontWeight: 'bold', py: 0.5 }} align="center">Action</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {history.length === 0 ? (
                              <TableRow>
                                  <TableCell colSpan={6} align="center" sx={{ color: '#8899bb', py: 2, fontSize: '11px' }}>No Previous Advances</TableCell>
                              </TableRow>
                          ) : (
                              history.map((row, i) => (
                                  <TableRow key={i}>
                                      <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2d45' }}>
                                          {dayjs(row.date).format("DD-MM-YY")} {row.time}
                                      </TableCell>
                                      <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2d45' }}>{row.advance_type}</TableCell>
                                      <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2d45' }}>{row.pay_mode}</TableCell>
                                      <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2d45' }}>{row.user_name}</TableCell>
                                      <TableCell sx={{ color: '#00ff00', fontSize: '11px', borderBottom: '1px solid #1e2d45', fontWeight: 'bold' }} align="right">{row.advance_amount}</TableCell>
                                      <TableCell sx={{ borderBottom: '1px solid #1e2d45' }} align="center">
                                          <Button size="small" onClick={() => handleEdit(row)} sx={{ fontSize: '10px', color: '#ffaa00', p: 0, minWidth: 0 }}>EDIT</Button>
                                      </TableCell>
                                  </TableRow>
                              ))
                          )}
                      </TableBody>
                  </Table>
              </TableContainer>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
