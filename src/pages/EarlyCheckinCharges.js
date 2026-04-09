import React, { useState, useEffect } from "react";
import { 
  Box, Typography, TextField, Button, Select, MenuItem, CircularProgress, 
  Paper, Grid 
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../API/API";
import dayjs from "dayjs";

const api = new API();

const fieldStyle = {
  bgcolor: "transparent",
  borderRadius: '4px',
  border: '1px solid #3a4a6b',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiOutlinedInput-root': { color: '#e0e6f0', height: '32px', fontSize: '13px' },
  '& .MuiInputBase-input': { padding: '4px 10px' },
  '& .MuiSelect-select': { padding: '4px 10px !important' },
  '& .MuiSvgIcon-root': { color: '#8899bb' },
};

const labelStyle = {
  color: '#8faac8',
  fontSize: '13px',
  fontWeight: '500',
  textAlign: 'right',
  pr: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  height: '32px'
};

const INITIAL_FORM = {
  check_in_id: "",
  reservation_id: "",
  room_number: "",
  guest_name: "",
  booking_type: "",
  company_name: "",
  service_name: "Early Check-In Charges",
  start_time: "10:00",
  end_time: "13:00",
  total_charges: 0,
  present_paid: 0,
  payment_mode: "UPI",
  payment_status: "PAID",
  transaction_date: dayjs().format("YYYY-MM-DD"),
  tariff_by: "SELF"
};

export default function EarlyCheckinCharges() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    if (location.state) {
       setFormData(prev => ({
          ...prev,
          room_number: location.state.room_number || prev.room_number,
          start_time: location.state.start_time || prev.start_time,
          end_time: location.state.end_time || prev.end_time,
          total_charges: location.state.total_charges || prev.total_charges,
          present_paid: location.state.total_charges || prev.present_paid, // auto-fill paid amount
          guest_name: location.state.guest_name || prev.guest_name,
          company_name: location.state.company_name || prev.company_name,
          booking_type: location.state.booking_type || prev.booking_type
       }));
       
       // Only search database if we don't already have the pre-populated checkin details
       if (location.state.room_number && !location.state.guest_name) {
          handleRoomSearch(location.state.room_number);
       }
    }
  }, [location.state]);

  const handleRoomSearch = async (num) => {
    if (!num) return;
    setFetching(true);
    try {
      const res = await api.get(`api/room-masters/current-guest?room_number=${num}`);
      const data = res?.data?.data || res?.data;
      if (data) {
        setFormData(prev => ({
          ...prev,
          room_number: num,
          check_in_id: data.check_in_id || data.id || "",
          reservation_id: data.reservation_id || "",
          guest_name: data.guest_name || data.check_in_guest_name || "",
          company_name: data.company_name || data.corporate_name || "WALKIN",
          booking_type: data.booking_type || "SINGLE",
        }));
      } else {
        toast.info("No active guest in Room " + num);
        setFormData({ ...INITIAL_FORM, room_number: num });
      }
    } catch (e) {
      toast.error("Failed to find occupant");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (status) => {
    if (!formData.room_number || !formData.guest_name) {
       toast.error("Please search and select a valid guest."); return;
    }
    setLoading(true);
    try {
      const payload = {
          ...formData,
          payment_status: status || formData.payment_status,
          // Formatting transaction_date for database if needed
          transaction_date: formData.transaction_date 
      };
      await api.post("api/guest-additional-services", payload);
      toast.success("Early Check-In Charges recorded successfully");
      if (location.state?.post_early_checkin_redirect) {
         navigate(location.state.post_early_checkin_redirect, { 
             state: { 
                 room_number: formData.room_number,
                 room_id: location.state.room_id || "", 
                 resume_reservation_data: location.state.resume_reservation_data,
                 reservation_id_to_resume: location.state.reservation_id_to_resume
             } 
         });
      } else {
         navigate("/room-master");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, name, type = "text", options = [], isSelect = false, yellowText = false) => (
    <Grid container spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
      <Grid item xs={5}>
        <Typography sx={labelStyle}>{label}</Typography>
      </Grid>
      <Grid item xs={7}>
        {isSelect ? (
          <Select 
            fullWidth size="small" name={name} 
            value={formData[name]} 
            onChange={(e) => setFormData(p => ({ ...p, [name]: e.target.value }))} 
            sx={fieldStyle}
          >
            <MenuItem value=""><em>Select</em></MenuItem>
            {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        ) : (
          <TextField 
            fullWidth size="small" name={name} 
            value={formData[name]} 
            onChange={(e) => setFormData(p => ({ ...p, [name]: e.target.value.toUpperCase() }))}
            onBlur={name === 'room_number' ? () => handleRoomSearch(formData.room_number) : undefined}
            placeholder={name === 'room_number' ? "Type Room No" : ""}
            sx={{ 
                ...fieldStyle, 
                '& .MuiInputBase-input': { 
                    color: yellowText ? '#ffcc00' : '#e0e6f0', 
                    fontWeight: yellowText ? 'bold' : 'normal',
                    textAlign: yellowText ? 'center' : 'left'
                },
                '& .Mui-disabled': { WebkitTextFillColor: '#8899bb !important' }
            }} 
            disabled={fetching && name !== 'room_number'}
          />
        )}
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ minHeight: 'calc(100vh - 50px)', bgcolor: '#060d17', p: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <Paper sx={{ width: '100%', maxWidth: 850, bgcolor: '#0b1120', borderRadius: '4px', overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        
        {/* Header */}
        <Box sx={{ bgcolor: '#008080', px: 2, py: 1, borderBottom: '1px solid #146A8F' }}>
          <Typography sx={{ color: '#fff', fontSize: '18px', fontWeight: '500', letterSpacing: '0.5px' }}>Early Check In Receipt</Typography>
        </Box>

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <Grid container spacing={{ xs: 2, md: 6 }}>
            
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              {renderField("Room No:", "room_number", "text", [], false, true)}
              {renderField("Guest Name:", "guest_name")}
              {renderField("Booking Type:", "booking_type")}
              {renderField("Company Name:", "company_name")}
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
                <Grid container spacing={1} alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Grid item xs={5}>
                        <Typography sx={{ ...labelStyle, pt: 1 }}>Early Check-In Timings:</Typography>
                    </Grid>
                    <Grid item xs={7}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ color: '#576478', fontSize: '10px', mb: 0.2, textAlign: 'center' }}>Start Time</Typography>
                                <TextField fullWidth size="small" value={formData.start_time} onChange={(e) => setFormData(p => ({ ...p, start_time: e.target.value }))} sx={fieldStyle} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ color: '#576478', fontSize: '10px', mb: 0.2, textAlign: 'center' }}>End Time</Typography>
                                <TextField fullWidth size="small" value={formData.end_time} onChange={(e) => setFormData(p => ({ ...p, end_time: e.target.value }))} sx={fieldStyle} />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

              {renderField("Early Check In Charges:", "total_charges")}
              {renderField("Receipt Date:", "transaction_date")}
              {renderField("Adjustment & Paid:", "present_paid")}
              
              {renderField("Tariff By:", "tariff_by", "text", ["SELF", "COMPANY", "AGENT", "GOIBIBO", "MMT"], true)}
              {renderField("Payment Status:", "payment_status", "text", ["PAID", "PAYMENT PENDING"], true)}
              {renderField("Trans. Mode:", "payment_mode", "text", ["CASH", "UPI", "CARD", "NEFT", "GPAY"], true)}
            </Grid>
          </Grid>

          {/* Buttons */}
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Button 
                onClick={() => handleSave("PAID")} 
                disabled={loading || fetching}
                sx={{ 
                    bgcolor: '#008000', color: '#fff', px: 5, height: '38px', minWidth: '140px',
                    '&:hover': { bgcolor: '#006400' }, fontWeight: 'bold', fontSize: '14px', borderRadius: '4px'
                }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "PAY"}
            </Button>
            <Button 
                onClick={() => handleSave("PAYMENT PENDING")} 
                disabled={loading || fetching}
                sx={{ 
                    bgcolor: '#146A8F', color: '#fff', px: 3, height: '38px', minWidth: '180px',
                    '&:hover': { bgcolor: '#0d4e6b' }, fontWeight: 'bold', fontSize: '14px', borderRadius: '4px'
                }}
            >
              PAYMENT PENDING
            </Button>
            <Button 
                onClick={() => navigate("/room-master")} 
                sx={{ 
                    bgcolor: 'transparent', color: '#8899bb', border: '1px solid #3a4a6b', px: 3, height: '38px',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' }, fontWeight: 'bold', fontSize: '14px' 
                }}
            >
              CLOSE
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
