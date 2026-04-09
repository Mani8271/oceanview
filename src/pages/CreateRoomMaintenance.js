import React, { useState, useEffect } from "react";
import { 
  Box, Typography, TextField, Button, Select, MenuItem, CircularProgress, 
  Paper, Grid, Table, TableBody, TableCell, TableHead, TableRow, TableContainer 
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../API/API";
import dayjs from "dayjs";

const api = new API();

const fieldStyle = {
  bgcolor: "#1a2035",
  borderRadius: '4px',
  border: '1px solid #3a4a6b',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiOutlinedInput-root': { color: '#e0e6f0', height: '32px', fontSize: '12px' },
  '& .MuiInputBase-input': { padding: '4px 8px' },
  '& .MuiSelect-select': { padding: '4px 8px !important' },
  '& .MuiSvgIcon-root': { color: '#8899bb' },
};

const labelStyle = {
  color: '#8faac8',
  fontSize: '11px',
  fontWeight: '600',
  width: '100px',
  textAlign: 'right',
  pr: 1.5,
  textTransform: 'uppercase'
};

const INITIAL_CREATE = {
  room_number: "",
  room_id: "",
  date: dayjs().format("YYYY-MM-DD"),
  department_name: "",
  category: "",
  remark: ""
};

export default function CreateRoomMaintenance() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  
  const [departments, setDepartments] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [roomDetails, setRoomDetails] = useState(null);
  const [createData, setCreateData] = useState(INITIAL_CREATE);

  useEffect(() => {
    fetchDeptsAndCats();
    if (location.state?.room_number) {
      const num = location.state.room_number;
      setCreateData(prev => ({ ...prev, room_number: num }));
      fetchRoomDetails(num);
      fetchMaintenanceList(num);
    }
  }, [location.state]);

  const fetchDeptsAndCats = async () => {
    try {
      const [deptRes, catRes] = await Promise.all([
        api.get("api/departments"),
        api.get("api/categories")
      ]);
      setDepartments(deptRes?.data?.data || deptRes?.data || []);
      setAllCategories(catRes?.data?.data || catRes?.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchMaintenanceList = async (num) => {
    if (!num) return;
    setListLoading(true);
    try {
      const res = await api.get(`api/maintenances?room_number=${num}`);
      setMaintenanceList(res?.data?.data || res?.data || []);
    } catch (e) {
      setMaintenanceList([]);
    } finally {
      setListLoading(false);
    }
  };

  const fetchRoomDetails = async (num) => {
    if (!num) return null;
    try {
      const res = await api.get(`api/room-masters?room_number=${num}`);
      let found = null;
      const arr = res?.data?.data || res?.data || [];
      if (Array.isArray(arr) && arr.length > 0) {
          found = arr.find(r => String(r.room_number) === String(num)) || arr[0];
      } else if (arr && !Array.isArray(arr)) {
          found = arr;
      }
      if (found) {
        setRoomDetails(found);
        const rId = found.id || found.room_id || found.room_master_id;
        setCreateData(prev => ({ ...prev, room_id: rId }));
        return rId;
      }
    } catch (e) { }
    return null;
  };

  useEffect(() => {
    if (createData.department_name) {
      const dept = departments.find(d => d.department_name === createData.department_name);
      setCategories(dept ? allCategories.filter(c => c.department_id === dept.id) : []);
    }
  }, [createData.department_name, departments, allCategories]);

  const handleCreateSubmit = async () => {
    if (!createData.room_number || !createData.department_name) {
      toast.error("Enter Room No and Department"); return;
    }
    let finalRoomId = createData.room_id;
    if (!finalRoomId) {
       finalRoomId = await fetchRoomDetails(createData.room_number);
    }
    if (!finalRoomId) {
       toast.error("Room ID not found for " + createData.room_number);
       return;
    }
    setLoading(true);
    try {
      await api.post("api/maintenances", { ...createData, room_id: finalRoomId });
      toast.success("Maintenance Created Successfully");
      fetchMaintenanceList(createData.room_number);
      setCreateData({ ...INITIAL_CREATE, room_number: createData.room_number, room_id: finalRoomId });
    } catch (e) { 
        toast.error(e.response?.data?.message || "Failed to create Record"); 
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0b1120', p: 2 }}>
      <Paper sx={{ bgcolor: '#111c31', borderRadius: '4px', overflow: 'hidden', border: '1px solid #253050', mb: 3 }}>
        <Box sx={{ bgcolor: '#008080', px: 2, py: 1.1 }}>
          <Typography sx={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>Create Room Maintenance</Typography>
        </Box>
        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={labelStyle}>Room No:</Typography>
                  <TextField fullWidth size="small" value={createData.room_number} onChange={(e) => {
                     const v = e.target.value.toUpperCase();
                     setCreateData(prev => ({ ...prev, room_number: v }));
                     if (v.length >= 3) { fetchRoomDetails(v); fetchMaintenanceList(v); }
                  }} sx={{ ...fieldStyle, '& .MuiInputBase-input': { color: '#ffaa00', fontWeight: 'bold', textAlign: 'center' } }} />
                </Box>
                {roomDetails && (
                  <Box sx={{ ml: '100px', mt: -1.5, p: 0.8, borderRadius: '4px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px dashed #3a4a6b', textAlign: 'center' }}>
                    <Typography sx={{ color: '#10b981', fontSize: '10px', fontWeight: 'bold' }}>
                      TYPE: {roomDetails.room_type || "---"} | STATUS: {roomDetails.status || "---"}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={labelStyle}>Dept:</Typography>
                  <Select fullWidth size="small" value={createData.department_name} onChange={(e) => setCreateData(prev => ({ ...prev, department_name: e.target.value.toUpperCase() }))} sx={fieldStyle}>
                    {departments.map(d => <MenuItem key={d.id} value={d.department_name}>{d.department_name}</MenuItem>)}
                  </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={labelStyle}>Category:</Typography>
                  <Select fullWidth size="small" value={createData.category} onChange={(e) => setCreateData(prev => ({ ...prev, category: e.target.value.toUpperCase() }))} sx={fieldStyle}>
                    {categories.map(c => <MenuItem key={c.id} value={c.category_name}>{c.category_name}</MenuItem>)}
                  </Select>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={labelStyle}>Date:</Typography>
                  <TextField fullWidth size="small" type="date" value={createData.date} onChange={(e) => setCreateData(prev => ({ ...prev, date: e.target.value }))} sx={fieldStyle} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ ...labelStyle, mt: 1 }}>Remarks:</Typography>
                  <TextField multiline rows={3} fullWidth size="small" value={createData.remark} onChange={(e) => setCreateData(prev => ({ ...prev, remark: e.target.value }))} sx={{ ...fieldStyle, '& .MuiOutlinedInput-root': { height: 'auto', p: 1 } }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1 }}>
                    <Button variant="contained" onClick={() => navigate("/room-master")} sx={{ bgcolor: '#d32f2f', fontWeight: 'bold', width: '120px' }}>CLOSE</Button>
                    <Button variant="contained" onClick={handleCreateSubmit} disabled={loading} sx={{ bgcolor: '#008080', fontWeight: 'bold', width: '120px' }}>
                        {loading ? <CircularProgress size={20} color="inherit" /> : "SAVE"}
                    </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* TABLE */}
      <Box sx={{ mt: 1 }}>
        <TableContainer sx={{ border: '1px solid #3a4a6b', borderRadius: '4px', maxHeight: '400px' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#008080', color: '#fff', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #253050' } }}>
                <TableCell>Room</TableCell><TableCell>Dept</TableCell><TableCell>Category</TableCell><TableCell>Status</TableCell><TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ bgcolor: '#0e1729' }}>
               {maintenanceList.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: '#ffaa00', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #1e2c45' }}>{row.room_number}</TableCell>
                  <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2c45' }}>{row.department_name}</TableCell>
                  <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2c45' }}>{row.category}</TableCell>
                  <TableCell sx={{ color: '#e89e2c', fontSize: '11px', borderBottom: '1px solid #1e2c45' }}>{row.status}</TableCell>
                  <TableCell sx={{ color: '#8899bb', fontSize: '10px', borderBottom: '1px solid #1e2c45' }}>{dayjs(row.created_at).format("YYYY-MM-DD HH:mm")}</TableCell>
                </TableRow>
               ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
