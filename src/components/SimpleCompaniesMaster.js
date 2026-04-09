import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function SimpleCompaniesMaster() {
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("api/companies");
      const data = res?.data?.data || res?.data || [];
      setCompanies(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (comp = null) => {
    if (comp) {
      setEditId(comp.id);
      setName(comp.company_name);
    } else {
      setEditId(null);
      setName("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Company Name is required");
      return;
    }

    try {
      if (editId) {
        await api.put(`api/companies/${editId}`, { company_name: name });
        toast.success("Company updated successfully");
      } else {
        await api.post("api/companies", { company_name: name });
        toast.success("Company added successfully");
      }
      handleClose();
      fetchCompanies();
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await api.delete(`api/companies/${id}`);
        toast.success("Company deleted successfully");
        fetchCompanies();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Company Names Master</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary" sx={{ borderRadius: 2 }}>
          + Add New Company
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #ccc' }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Company Name</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.length > 0 ? (
              companies.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell fontWeight="bold">{row.company_name}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" color="primary" sx={{ mr: 1, borderRadius: 2 }} onClick={() => handleOpen(row)}>
                      Edit
                    </Button>
                    <Button size="small" variant="outlined" color="error" sx={{ borderRadius: 2 }} onClick={() => handleDelete(row.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>No Companies Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ bgcolor: '#f5f5f5' }}>{editId ? "Edit Company" : "Add Company"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Company Name"
            type="text"
            fullWidth
            variant="outlined"
            placeholder="e.g. GOIBIBO, OYO"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ px: 4, borderRadius: 2 }}>
            {editId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
