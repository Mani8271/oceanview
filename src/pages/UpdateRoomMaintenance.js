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

const INITIAL_UPDATE = {
  id: null,
  room_number: "",
  date: dayjs().format("YYYY-MM-DD"),
  department_name: "",
  category: "",
  issue_type: "CLEANING",
  remark: "",
  status: "IN PROGRESS",
  amount: "0.00",
  payment_mode: "CASH",
  payment_remarks: ""
};

export default function UpdateRoomMaintenance() {
  const navigate = useNavigate();
  const location = useLocation();
  const [updLoading, setUpdLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  
  const [departments, setDepartments] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categoriesUpd, setCategoriesUpd] = useState([]);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [updateData, setUpdateData] = useState(INITIAL_UPDATE);

  useEffect(() => {
    fetchDeptsAndCats();
    if (location.state?.room_number) {
      const num = location.state.room_number;
      setUpdateData(prev => ({ ...prev, room_number: num }));
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

  useEffect(() => {
    if (updateData.department_name) {
      const dept = departments.find(d => d.department_name === updateData.department_name);
      setCategoriesUpd(dept ? allCategories.filter(c => c.department_id === dept.id) : []);
    }
  }, [updateData.department_name, departments, allCategories]);

  const handleUpdateSubmit = async () => {
    if (!updateData.id) { toast.warning("Select record from table"); return; }
    setUpdLoading(true);
    try {
      await api.put(`api/maintenances/${updateData.id}`, updateData);
      toast.success("Maintenance Updated Successfully");
      fetchMaintenanceList(updateData.room_number);
      setUpdateData(INITIAL_UPDATE);
    } catch (e) { toast.error("Failed to update"); }
    finally { setUpdLoading(false); }
  };

  const handleEditClick = (record) => {
    setUpdateData({
      id: record.id,
      room_number: record.room_number || "",
      date: record.date || dayjs().format("YYYY-MM-DD"),
      department_name: record.department_name || "",
      category: record.category || "",
      issue_type: record.issue_type || "REPAIR",
      remark: record.remark || "",
      status: record.status || "IN PROGRESS",
      amount: record.amount || "0.00",
      payment_mode: record.payment_mode || "CASH",
      payment_remarks: record.payment_remarks || ""
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0b1120', p: 2 }}>
      <Paper sx={{ bgcolor: '#111c31', borderRadius: '4px', overflow: 'hidden', border: '1px solid #253050', mb: 3 }}>
        <Box sx={{ bgcolor: '#008080', px: 2, py: 1.1 }}>
          <Typography sx={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>Update Room Maintenance Details</Typography>
        </Box>
        <Box sx={{ p: 4 }}>
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                   <Box sx={{ width: '100px', textAlign: 'right', pr: 1.5 }}>
                      <Typography sx={{ color: '#8faac8', fontSize: '11px', fontWeight: 'bold' }}>ROOM NO:</Typography>
                      <Typography onClick={() => fetchMaintenanceList(updateData.room_number)} sx={{ color: '#e89e2c', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>History</Typography>
                   </Box>
                   <TextField fullWidth size="small" value={updateData.room_number || "---"} disabled sx={{ ...fieldStyle, bgcolor: 'rgba(255,255,255,0.02)', '& .MuiInputBase-input': { color: '#ffaa00', fontWeight: 'bold', textAlign: 'center' } }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={labelStyle}>Trans. Date:</Typography>
                  <TextField fullWidth size="small" type="date" value={updateData.date} onChange={(e) => setUpdateData(prev => ({ ...prev, date: e.target.value }))} sx={fieldStyle} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={labelStyle}>Department:</Typography>
                  <Select fullWidth size="small" value={updateData.department_name} onChange={(e) => setUpdateData(prev => ({ ...prev, department_name: e.target.value.toUpperCase() }))} sx={fieldStyle}>
                    {departments.map(d => <MenuItem key={d.id} value={d.department_name}>{d.department_name}</MenuItem>)}
                  </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={labelStyle}>Category:</Typography>
                  <Select fullWidth size="small" value={updateData.category} onChange={(e) => setUpdateData(prev => ({ ...prev, category: e.target.value.toUpperCase() }))} sx={fieldStyle}>
                    {categoriesUpd.map(c => <MenuItem key={c.id} value={c.category_name}>{c.category_name}</MenuItem>)}
                  </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={labelStyle}>Issue Type:</Typography>
                  <Select fullWidth size="small" value={updateData.issue_type} onChange={(e) => setUpdateData(prev => ({ ...prev, issue_type: e.target.value.toUpperCase() }))} sx={fieldStyle}>
                    <MenuItem value="CLEANING">CLEANING</MenuItem>
                    <MenuItem value="REPAIR">REPAIR</MenuItem>
                  </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ ...labelStyle, mt: 1 }}>Issue Remarks:</Typography>
                  <TextField multiline rows={3} fullWidth size="small" value={updateData.remark} onChange={(e) => setUpdateData(prev => ({ ...prev, remark: e.target.value }))} sx={{ ...fieldStyle, '& .MuiOutlinedInput-root': { height: 'auto', p: 1 } }} />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={labelStyle}>Status:</Typography>
                  <Select fullWidth size="small" value={updateData.status} onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value.toUpperCase() }))} sx={fieldStyle}>
                    <MenuItem value="PENDING">PENDING</MenuItem>
                    <MenuItem value="IN PROGRESS">IN PROGRESS</MenuItem>
                    <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                  </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={labelStyle}>Amount:</Typography>
                  <TextField fullWidth size="small" type="number" value={updateData.amount} onChange={(e) => setUpdateData(prev => ({ ...prev, amount: e.target.value }))} sx={fieldStyle} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={labelStyle}>Payment Mode:</Typography>
                  <Select fullWidth size="small" value={updateData.payment_mode} onChange={(e) => setUpdateData(prev => ({ ...prev, payment_mode: e.target.value.toUpperCase() }))} sx={fieldStyle}>
                    <MenuItem value="CASH">CASH</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="CARD">CARD</MenuItem>
                  </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={labelStyle}>PAY REMARKS:</Typography>
                  <TextField multiline rows={3} fullWidth size="small" value={updateData.payment_remarks} onChange={(e) => setUpdateData(prev => ({ ...prev, payment_remarks: e.target.value }))} sx={{ ...fieldStyle, '& .MuiOutlinedInput-root': { height: 'auto', p: 1 } }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
                   <Button variant="contained" onClick={() => navigate("/room-master")} sx={{ bgcolor: '#d32f2f', px: 4, fontWeight: 'bold' }}>CLOSE</Button>
                   <Button variant="contained" onClick={handleUpdateSubmit} disabled={updLoading} sx={{ bgcolor: '#228b22', px: 4, fontWeight: 'bold' }}>
                     {updLoading ? <CircularProgress size={20} color="inherit" /> : "UPDATE"}
                   </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* TABLE */}
      <Box sx={{ mt: 1 }}>
        <TableContainer sx={{ border: '1px solid #3a4a6b', borderRadius: '4px', maxHeight: '350px' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#008080', color: '#fff', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #253050' } }}>
                <TableCell>Room</TableCell><TableCell>Dept</TableCell><TableCell>Category</TableCell><TableCell>Status</TableCell><TableCell>Amount</TableCell><TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ bgcolor: '#0e1729' }}>
               {maintenanceList.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: '#ffaa00', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #1e2c45' }}>{row.room_number}</TableCell>
                  <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2c45' }}>{row.department_name}</TableCell>
                  <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2c45' }}>{row.category}</TableCell>
                  <TableCell sx={{ color: '#e89e2c', fontSize: '11px', borderBottom: '1px solid #1e2c45' }}>{row.status}</TableCell>
                  <TableCell sx={{ color: '#e0e6f0', fontSize: '11px', borderBottom: '1px solid #1e2c45' }}>₹{row.amount}</TableCell>
                  <TableCell align="center" sx={{ borderBottom: '1px solid #1e2c45' }}>
                    <Button size="small" onClick={() => handleEditClick(row)} sx={{ color: '#4B90FC', fontSize: '10px' }}>Select</Button>
                  </TableCell>
                </TableRow>
               ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
