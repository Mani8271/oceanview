import React, { useState, useEffect } from "react";
import { 
  Box, Typography, TextField, Button, Select, MenuItem, CircularProgress, 
  Paper, Grid, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
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
  check_in_id: "",
  room_number: "",
  guest_name: "",
  phone_number: "",
  company_name: "",
  room_type: "",
  booking_type: "",
  check_in_date: "",
  check_out_date: "",
  total_nights: 0,
  
  service_id: "",
  service_name: "",
  price_per_day: 0,
  no_of_days: 1,
  total_charges: 0,
  present_paid: 0,
  remaining_balance: 0,
  transaction_date: dayjs().format("YYYY-MM-DD"),
  transaction_time: dayjs().format("HH:mm"),
  payment_mode: "CASH"
};

export default function AdditionalServices() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetchingGuest, setFetchingGuest] = useState(false);
  const [services, setServices] = useState([]);
  const [history, setHistory] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchServices();
    if (location.state?.room_number) {
      handleRoomSearch(location.state.room_number);
    }
  }, [location.state]);

  const fetchServices = async () => {
    try {
      const res = await api.get("api/additional-services");
      setServices(res?.data?.data || res?.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async (cid, rid) => {
    if (!cid && !rid) return;
    try {
      const res = await api.get(`api/guest-additional-services`);
      let list = res?.data?.data || res?.data || [];
      if (!Array.isArray(list)) list = [];
      
      // Filter list to show only this guest's services
      const filtered = list.filter(item => 
        (cid && String(item.check_in_id) === String(cid)) || 
        (rid && String(item.reservation_id) === String(rid))
      );
      setHistory(filtered);
    } catch (e) { }
  };

  const handleRoomSearch = async (num) => {
    if (!num) return;
    setFetchingGuest(true);
    setFormData(prev => ({ ...prev, room_number: num }));
    try {
      const res = await api.get(`api/room-masters/current-guest?room_number=${num}`);
      const data = res?.data?.data || res?.data;
      if (data) {
        const checkinIdForSearch = data.check_in_id || data.id;
        const phone = data.phone_no || data.mobile_no || data.phone_number || data.guest_phone_no || "";
        
        setFormData(prev => ({
          ...prev,
          reservation_id: data.reservation_id || data.id || "",
          check_in_id: checkinIdForSearch || "",
          guest_name: data.guest_name || data.check_in_guest_name || "",
          phone_number: phone,
          company_name: data.company_name || data.corporate_name || "WALKIN",
          room_type: data.room_type || "",
          booking_type: data.booking_type || "Multiple Day",
          check_in_date: data.check_in_date || "",
          check_out_date: data.check_out_date || "",
          total_nights: calculateNights(data.check_in_date, data.check_out_date)
        }));

        fetchHistory(checkinIdForSearch, data.reservation_id || data.id);

        // Second Step: Deep fetch recovery
        if (!phone && checkinIdForSearch) {
           try {
              const fullRes = await api.get(`api/check-ins/${checkinIdForSearch}`);
              const fullData = fullRes?.data?.data || fullRes?.data;
              if (fullData) {
                 setFormData(prev => ({
                   ...prev,
                   phone_number: fullData.guest_phone_no || fullData.mobile_no || fullData.phone_no || prev.phone_number,
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

  const calculateNights = (start, end) => {
    if (!start || !end) return 0;
    const diff = dayjs(end).diff(dayjs(start), 'day');
    return diff > 0 ? diff : 1;
  };

  const handleServiceChange = (serviceId) => {
    const service = services.find(s => String(s.id) === String(serviceId));
    if (service) {
      const perDay = parseFloat(service.amount || 0);
      const days = parseInt(formData.no_of_days || 1);
      const total = perDay * days;
      const paid = parseFloat(formData.present_paid || 0);
      setFormData(prev => ({
        ...prev,
        service_id: serviceId,
        service_name: service.service_name,
        price_per_day: perDay,
        total_charges: total,
        remaining_balance: total - paid
      }));
    }
  };

  const handleCalculation = (name, value) => {
    const perDay = parseFloat(name === 'price_per_day' ? value : formData.price_per_day || 0);
    const days = parseInt(name === 'no_of_days' ? (value || 0) : formData.no_of_days || 0);
    const paid = parseFloat(name === 'present_paid' ? (value || 0) : formData.present_paid || 0);
    const total = perDay * days;
    const balance = total - paid;
    setFormData(prev => ({ ...prev, [name]: value, total_charges: total, remaining_balance: balance }));
  };

  const handleEdit = (row) => {
    const tDate = row.transaction_date ? row.transaction_date.split(" ")[0] : dayjs().format("YYYY-MM-DD");
    const tTime = row.transaction_date ? row.transaction_date.split(" ")[1]?.substring(0, 5) : dayjs().format("HH:mm");
    
    setEditId(row.id);
    setFormData(prev => ({
      ...prev,
      service_id: row.service_id,
      service_name: row.service_name,
      price_per_day: row.price_per_day,
      no_of_days: row.no_of_days,
      total_charges: row.total_charges,
      present_paid: row.present_paid,
      remaining_balance: row.remaining_balance,
      payment_mode: row.payment_mode || "CASH",
      transaction_date: tDate,
      transaction_time: tTime
    }));
  };

  const handleSave = async () => {
    if (!formData.check_in_id) {
       toast.error("Valid Check-In ID required. Search Room No."); return;
    }
    setLoading(true);
    try {
      const payload = {
          ...formData,
          transaction_date: `${formData.transaction_date} ${formData.transaction_time}:00`
      };
      if (editId) {
        await api.put(`api/guest-additional-services/${editId}`, payload);
        toast.success("Service Charge Updated");
      } else {
        await api.post("api/guest-additional-services", payload);
        toast.success("Service Charge Added");
      }
      setEditId(null);
      setFormData(INITIAL_FORM);
      if (formData.room_number) handleRoomSearch(formData.room_number);
    } catch (e) {
      toast.error(e.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 50px)', bgcolor: '#0b1120', p: 3, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ width: '100%', maxWidth: 900, bgcolor: '#0e1729', borderRadius: '4px', overflow: 'hidden', border: '1px solid #3a4a6b', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <Box sx={{ bgcolor: '#b22222', px: 2, py: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Additional Services Page</Typography>
          <Button onClick={() => navigate("/room-master")} sx={{ color: '#fff', fontSize: '12px', bgcolor: 'rgba(0,0,0,0.4)', px: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>Close</Button>
        </Box>

        <Box sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Left Column: Guest Data */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                
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
                  <TextField fullWidth size="small" value={formData.guest_name} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Phone Number</Typography>
                  <TextField fullWidth size="small" value={formData.phone_number} 
                    onChange={(e) => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                    sx={fieldStyle} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Company Name</Typography>
                  <TextField fullWidth size="small" value={formData.company_name} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Room Type</Typography>
                  <TextField fullWidth size="small" value={formData.room_type} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Booking Type</Typography>
                  <TextField fullWidth size="small" value={formData.booking_type} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Check In & Check Out</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField fullWidth size="small" value={formData.check_in_date} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                    <TextField fullWidth size="small" value={formData.check_out_date} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography sx={{ ...labelStyle, fontSize: '10px' }}>No of Night</Typography>
                    <TextField size="small" value={formData.total_nights} disabled sx={{ ...fieldStyle, width: '100px', bgcolor: 'rgba(255,255,255,0.03)' }} />
                  </Box>
                </Box>

              </Box>
            </Grid>

            {/* Right Column: Service Options */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                
                <Box>
                  <Typography sx={labelStyle}>Service Type</Typography>
                  <Select fullWidth size="small" value={formData.service_id} onChange={(e) => handleServiceChange(e.target.value)} sx={fieldStyle}>
                    <MenuItem value=""><em>Select Service</em></MenuItem>
                    {services.map(s => <MenuItem key={s.id} value={s.id}>{s.service_name}</MenuItem>)}
                  </Select>
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Per Day (Price)</Typography>
                  <TextField fullWidth size="small" type="number" value={formData.price_per_day} onChange={(e) => handleCalculation('price_per_day', e.target.value)} sx={fieldStyle} />
                </Box>

                <Box>
                   <Typography sx={labelStyle}>No. of Days</Typography>
                   <TextField fullWidth size="small" type="number" value={formData.no_of_days} onChange={(e) => handleCalculation('no_of_days', e.target.value)} sx={fieldStyle} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Charges (Total)</Typography>
                  <TextField fullWidth size="small" value={formData.total_charges} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)' }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Present Paid</Typography>
                  <TextField fullWidth size="small" type="number" value={formData.present_paid} onChange={(e) => handleCalculation('present_paid', e.target.value)} sx={fieldStyle} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Remaining Balance</Typography>
                  <TextField fullWidth size="small" value={formData.remaining_balance} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.03)', '& .MuiInputBase-input': { color: '#ff5555' } }} />
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Transaction Date & Time</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField fullWidth size="small" type="date" value={formData.transaction_date} onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))} sx={fieldStyle} />
                    <TextField fullWidth size="small" type="time" value={formData.transaction_time} onChange={(e) => setFormData(prev => ({ ...prev, transaction_time: e.target.value }))} sx={fieldStyle} />
                  </Box>
                </Box>

                <Box>
                  <Typography sx={labelStyle}>Payment Mode</Typography>
                  <Select fullWidth size="small" value={formData.payment_mode} onChange={(e) => setFormData(prev => ({ ...prev, payment_mode: e.target.value }))} sx={fieldStyle}>
                    <MenuItem value="CASH">CASH</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="CARD">CARD</MenuItem>
                  </Select>
                </Box>

              </Box>
            </Grid>
          </Grid>

          {/* Buttons Section */}
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 4 }}>
             <Button 
                onClick={() => navigate("/room-master")} 
                sx={{ bgcolor: '#0e1729', color: '#fff', border: '2px solid #ef4444', px: 5, height: '40px', fontWeight: 'bold', '&:hover': { bgcolor: '#ef4444' } }}
             >
                CLOSE
             </Button>
             <Button 
                onClick={handleSave} 
                disabled={loading || fetchingGuest} 
                sx={{ bgcolor: '#0e1729', color: '#fff', border: '2px solid #10b981', px: 5, height: '40px', fontWeight: 'bold', '&:hover': { bgcolor: '#10b981' } }}
             >
                 {loading ? <CircularProgress size={20} color="inherit" /> : (editId ? "UPDATE" : "SAVE")}
             </Button>
          </Box>

          {/* History Table */}
          <Box sx={{ mt: 4 }}>
              <Typography sx={{ ...labelStyle, mb: 1, color: '#4B90FC' }}>Service History</Typography>
              <Box sx={{ bgcolor: '#0b1120', borderRadius: '4px', border: '1px solid #3a4a6b', overflow: 'hidden' }}>
                  <Table size="small">
                      <TableHead sx={{ bgcolor: '#1a2639' }}>
                          <TableRow>
                              <TableCell sx={{ color: '#8faac8', fontWeight: 'bold', fontSize: '11px' }}>Date</TableCell>
                              <TableCell sx={{ color: '#8faac8', fontWeight: 'bold', fontSize: '11px' }}>Service</TableCell>
                              <TableCell sx={{ color: '#8faac8', fontWeight: 'bold', fontSize: '11px' }}>Days</TableCell>
                              <TableCell sx={{ color: '#8faac8', fontWeight: 'bold', fontSize: '11px' }}>Total</TableCell>
                              <TableCell sx={{ color: '#8faac8', fontWeight: 'bold', fontSize: '11px' }}>Paid</TableCell>
                              <TableCell sx={{ color: '#8faac8', fontWeight: 'bold', fontSize: '11px' }}>Mode</TableCell>
                              <TableCell sx={{ color: '#8faac8', fontWeight: 'bold', fontSize: '11px' }} align="center">Action</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {history.length === 0 ? (
                              <TableRow><TableCell colSpan={7} align="center" sx={{ color: '#576478', py: 2 }}>No service records found</TableCell></TableRow>
                          ) : (
                              history.map((row) => (
                                  <TableRow key={row.id}>
                                      <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2639' }}>{dayjs(row.transaction_date).format("DD-MM-YY")}</TableCell>
                                      <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2639' }}>{row.service_name}</TableCell>
                                      <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2639' }}>{row.no_of_days}</TableCell>
                                      <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2639' }}>{row.total_charges}</TableCell>
                                      <TableCell sx={{ color: '#00ff00', fontSize: '11px', borderBottom: '1px solid #1e2639', fontWeight: 'bold' }}>{row.present_paid}</TableCell>
                                      <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2639' }}>{row.payment_mode}</TableCell>
                                      <TableCell sx={{ borderBottom: '1px solid #1e2639' }} align="center">
                                          <Button size="small" onClick={() => handleEdit(row)} sx={{ fontSize: '10px', color: '#ffaa00', p: 0, minWidth: 0 }}>EDIT</Button>
                                      </TableCell>
                                  </TableRow>
                              ))
                          )}
                      </TableBody>
                  </Table>
              </Box>
          </Box>

        </Box>
      </Paper>
    </Box>
  );
}
