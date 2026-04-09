import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, TextField, Button, Select, MenuItem, CircularProgress } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../API/API";
import dayjs from "dayjs";

const api = new API();

const darkField = {
  bgcolor: "#1a2035", borderRadius: '4px', border: '1px solid #3a4a6b',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiOutlinedInput-root': { color: '#e0e6f0', height: '32px', fontSize: '11px', bgcolor: '#1a2035' },
  '& .MuiInputBase-input': { padding: '4px 8px' },
  '& .Mui-disabled': { bgcolor: '#141c2e', WebkitTextFillColor: '#8899bb !important' },
  '& .MuiSelect-select': { padding: '4px 8px !important', color: '#e0e6f0' },
  '& .MuiSvgIcon-root': { color: '#8899bb' },
};

const getDarkLabel = () => ({
  color: '#6b7a90', fontSize: '10px', mb: 0.5, letterSpacing: '0.5px'
});

export default function RoomShift() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    old_room_number: "",
    new_room_number: "",
    shift_date: dayjs().format("YYYY-MM-DD"),
    department_name: "ELECTRICAL",
    category: "SWITCH BOARD",
    issue_type: "DAMAGE",
    remarks: "",
    guest_name: "",
    company_name: "",
    booking_type: "",
    room_type: "",
    check_in_date: "",
    check_out_date: "",
    reservation_id: null
  });

  // Handle initial room number from navigation state
  useEffect(() => {
    if (location.state?.old_room_number) {
      setFormData(prev => ({ ...prev, old_room_number: location.state.old_room_number }));
    }
  }, [location.state]);

  // Separate effect to trigger blur logic when old_room_number changes from state
  useEffect(() => {
    if (location.state?.old_room_number) {
       handleOldRoomBlur(location.state.old_room_number);
    }
  }, [location.state?.old_room_number]);

  // Fetch current guest whenever old_room_number changes
  const handleOldRoomBlur = async (num) => {
    const targetRoom = num || formData.old_room_number;
    if (!targetRoom) return;
    setLoading(true);
    try {
      const res = await api.get(`api/room-masters/current-guest?room_number=${targetRoom}`);
      const data = res?.data?.data || res?.data;
      if (data) {
        setFormData(prev => ({
          ...prev,
          guest_name: data.guest_name || "",
          booking_type: data.booking_type || "",
          room_type: data.room_type || "",
          check_in_date: data.check_in_date || "",
          check_out_date: data.check_out_date || "",
          company_name: data.company_name || "",
          reservation_id: data.reservation_id || null
        }));
      } else {
        toast.warn("No active guest found in this room");
      }
    } catch (e) {
      toast.error("Error fetching guest details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get(`api/room-masters/available-rooms?date=${formData.shift_date}`);
        setAvailableRooms(res?.data?.data || res?.data || []);
      } catch (e) {
        console.error("Failed to fetch available rooms", e);
      }
    };
    fetchRooms();
  }, [formData.shift_date]);

  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const res = await api.get("api/issue-types");
        setIssueTypes(res?.data?.data || res?.data || []);
      } catch (e) { console.error(e); }
    };
    fetchIssueTypes();

    const fetchDepts = async () => {
      try {
        const res = await api.get("api/departments");
        setDepartments(res?.data?.data || res?.data || []);
      } catch (e) { console.error(e); }
    };
    fetchDepts();

    const fetchCats = async () => {
      try {
        const res = await api.get("api/categories");
        setAllCategories(res?.data?.data || res?.data || []);
      } catch (e) { console.error(e); }
    };
    fetchCats();
  }, []);

  // Filter Categories when Department changes
  useEffect(() => {
    if (formData.department_name) {
        const dept = departments.find(d => d.department_name === formData.department_name);
        if (dept) {
            const filtered = allCategories.filter(c => c.department_id === dept.id);
            setCategories(filtered);
        } else {
            setCategories([]);
        }
    }
  }, [formData.department_name, departments, allCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleSave = async () => {
    if (!formData.old_room_number || !formData.new_room_number) {
      toast.error("Please select both old and new room numbers");
      return;
    }
    setLoading(true);
    try {
      await api.post("api/room-masters/shift", formData);
      toast.success(`Room shifted successfully from ${formData.old_room_number} to ${formData.new_room_number}`);
      navigate("/room-master");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to shift room");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (name, label, type = "text", options = [], isSelect = false, disabled = false) => {
    const isMultiline = name === 'remarks';
    const fieldStyle = {
      ...darkField,
      ...(isMultiline ? { '& .MuiOutlinedInput-root': { height: 'auto', py: 0.5 } } : {}),
      '& .MuiInputBase-input': { 
        padding: '4px 8px', 
        color: name === 'old_room_number' ? '#ffa500' : '#e0e6f0', 
        fontWeight: name === 'old_room_number' ? 'bold' : 'normal',
        fontSize: '11px'
      }
    };

    let fieldNode;
    const value = formData[name] || "";

    if (isSelect) {
      fieldNode = (
        <Select fullWidth size="small" name={name} value={value} onChange={handleInputChange} sx={fieldStyle} disabled={disabled}>
          <MenuItem value=""><em>-- Select --</em></MenuItem>
          {options.map((o, idx) => <MenuItem key={idx} value={o.room_number || o}>{o.room_number || o}</MenuItem>)}
        </Select>
      );
    } else {
      fieldNode = (
        <TextField 
          fullWidth size="small" name={name} value={value} 
          onChange={handleInputChange} onBlur={name === 'old_room_number' ? () => handleOldRoomBlur() : undefined} 
          multiline={isMultiline} rows={isMultiline ? 4 : 1} type={type} sx={fieldStyle} disabled={disabled}
        />
      );
    }

    return (
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={getDarkLabel()}>{label.toUpperCase().replace(':','')}</Typography>
        {fieldNode}
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a1128', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ 
        width: '100%', maxWidth: 860, bgcolor: '#0e1729', borderRadius: '12px', overflow: 'hidden', 
        boxShadow: '0 25px 60px rgba(0,0,0,0.7)', border: '1px solid #253050' 
      }}>
        {/* Header */}
        <Box sx={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #0e1729 100%)', px: 3, py: 2, borderBottom: '1px solid #253050' }}>
          <Typography sx={{ color: '#e0e6f0', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
             🏨 Room Shift Page
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* LEFT COLUMN - CURRENT INFO */}
            <Grid item xs={12} md={6}>
              {renderField('old_room_number', 'Room No')}
              {renderField('guest_name', 'Guest Name', 'text', [], false, true)}
              {renderField('company_name', 'Company Name', 'text', [], false, true)}
              {renderField('booking_type', 'Booking Type', 'text', [], false, true)}
              {renderField('room_type', 'Room Type', 'text', [], false, true)}
              {renderField('check_in_date', 'Check IN Date', 'text', [], false, true)}
              {renderField('check_out_date', 'Check Out Date', 'text', [], false, true)}
            </Grid>

            {/* RIGHT COLUMN - NEW INFO */}
            <Grid item xs={12} md={6}>
              {renderField('new_room_number', 'Select Room No', 'text', availableRooms, true)}
              {renderField('shift_date', 'Shift Date', 'date')}
              {renderField('department_name', 'Department', 'text', departments.map(d => d.department_name), true)}
              {renderField('category', 'Category', 'text', categories.map(c => c.category_name), true)}
              {renderField('issue_type', 'Issue Type', 'text', issueTypes.map(it => it.name), true)}
              {renderField('remarks', 'Remarks')}
            </Grid>
          </Grid>

          {/* Buttons aligned right bottom logic */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
            <Button 
              onClick={() => navigate("/room-master")}
              sx={{ 
                background: 'linear-gradient(to bottom, #d32f2f, #9a0007)', color: '#fff', 
                fontWeight: 'bold', fontSize: '12px', width: '100px', height: '32px', borderRadius: '4px'
              }}
            >
              CLOSE
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading}
              sx={{ 
                background: 'linear-gradient(to bottom, #28a745, #145523)', color: '#fff', 
                fontWeight: 'bold', fontSize: '12px', width: '100px', height: '32px', borderRadius: '4px'
              }}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : "SAVE"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
