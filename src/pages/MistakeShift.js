import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, TextField, Button, Select, MenuItem, CircularProgress } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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

export default function MistakeShift() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  
  const [checkinId, setCheckinId] = useState(null);
  const [formData, setFormData] = useState({
    old_room_number: location.state?.old_room_number || "",
    new_room_number: "",
    new_room_id: "",
    guest_name: "",
    check_in_date: "",
    check_out_date: "",
  });

  useEffect(() => {
    const initialId = paramId && paramId !== "undefined" ? paramId : (location.state?.checkin_id && location.state.checkin_id !== "undefined" ? location.state.checkin_id : null);
    
    if (initialId) {
      setCheckinId(initialId);
      fetchCheckinDetails(initialId);
    } else if (location.state?.old_room_number) {
      fetchIdByRoom(location.state.old_room_number);
    }
    fetchAvailableRooms();
  }, [paramId, location.state]);

  const fetchIdByRoom = async (num) => {
    try {
      const res = await api.get(`api/room-masters/current-guest?room_number=${num}`);
      const data = res?.data?.data || res?.data;
      if (data) {
        const foundId = data.check_in_id || data.id;
        if (foundId) {
           setCheckinId(foundId);
           fetchCheckinDetails(foundId);
        }
      }
    } catch (e) { }
  };

  const fetchCheckinDetails = async (targetId) => {
    if (!targetId || targetId === "undefined") return;
    try {
      const res = await api.get(`api/check-ins/${targetId}`);
      const data = res?.data?.data || res?.data;
      if (data) {
        setFormData(prev => ({
          ...prev,
          guest_name: data.check_in_guest_name || data.guest_name || "",
          check_in_date: data.check_in_date || "",
          check_out_date: data.check_out_date || "",
          old_room_number: data.room_number || prev.old_room_number || ""
        }));
      }
    } catch (e) {
      toast.error("Failed to load check-in details");
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const res = await api.get(`api/room-masters/available-rooms?date=${dayjs().format("YYYY-MM-DD")}`);
      setAvailableRooms(res?.data?.data || res?.data || []);
    } catch (e) {
      console.error("Failed to fetch rooms");
    }
  };

  const handleRoomSelect = (roomNum) => {
    const room = availableRooms.find(r => String(r.room_number) === String(roomNum));
    if (room) {
      setFormData(prev => ({
        ...prev,
        new_room_number: roomNum,
        new_room_id: room.id || room.room_id || room.room_master_id
      }));
    } else {
      setFormData(prev => ({ ...prev, new_room_number: roomNum }));
    }
  };

  const handleSave = async () => {
    if (!checkinId) { toast.error("Check-In ID missing"); return; }
    if (!formData.new_room_id) { toast.error("Please select a new room"); return; }
    
    setLoading(true);
    try {
      const payload = {
        new_room_id: formData.new_room_id,
        new_room_number: formData.new_room_number
      };
      await api.post(`api/check-ins/${checkinId}/mistake-shift`, payload);
      toast.success("Room corrected successfully!");
      navigate("/room-master");
    } catch (e) {
      toast.error(e.response?.data?.message || "Correction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a1128', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ 
        width: '100%', maxWidth: 500, bgcolor: '#0e1729', borderRadius: '12px', overflow: 'hidden', 
        boxShadow: '0 25px 60px rgba(0,0,0,0.7)', border: '1px solid #253050' 
      }}>
        <Box sx={{ background: 'linear-gradient(135deg, #b22222 0%, #0e1729 100%)', px: 3, py: 2, borderBottom: '1px solid #253050' }}>
          <Typography sx={{ color: '#e0e6f0', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
             🛠️ Mistake Correction (Room Shift)
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed #3a4a6b' }}>
            <Typography sx={{ color: '#8899bb', fontSize: '12px', mb: 1 }}>CURRENT ASSIGNMENT:</Typography>
            <Typography sx={{ color: '#ffaa00', fontSize: '18px', fontWeight: 'bold' }}>Room {formData.old_room_number}</Typography>
            <Typography sx={{ color: '#fff', fontSize: '14px', mt: 0.5 }}>{formData.guest_name}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography sx={getDarkLabel()}>SELECT CORRECT ROOM</Typography>
            <Select 
              fullWidth size="small" value={formData.new_room_number} 
              onChange={(e) => handleRoomSelect(e.target.value)} 
              sx={darkField}
            >
              <MenuItem value=""><em>-- Select Available Room --</em></MenuItem>
              {availableRooms.map((r, idx) => (
                <MenuItem key={idx} value={r.room_number}>{r.room_number} - {r.room_type}</MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4 }}>
            <Button 
                onClick={() => navigate("/room-master")}
                sx={{ bgcolor: '#333', color: '#fff', fontWeight: 'bold', width: '120px', '&:hover': { bgcolor: '#444' } }}
            >
                CLOSE
            </Button>
            <Button 
                onClick={handleSave} 
                disabled={loading}
                sx={{ bgcolor: '#b22222', color: '#fff', fontWeight: 'bold', width: '120px', '&:hover': { bgcolor: '#9a0007' } }}
            >
                {loading ? <CircularProgress size={20} color="inherit" /> : "CORRECT"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
