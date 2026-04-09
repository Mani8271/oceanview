import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from "@mui/material";
import API from "../API/API";
import { toast } from "react-toastify";

const api = new API();

export default function FoodPlansMaster() {
  const [foodPlans, setFoodPlans] = useState([]);
  const [open, setOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchFoodPlans();
  }, []);

  const fetchFoodPlans = async () => {
    try {
      const res = await api.get("api/food-plans");
      if (res && res.data) {
        setFoodPlans(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (plan = null) => {
    if (plan) {
      setEditId(plan.id);
      setPlanName(plan.plan_name);
    } else {
      setEditId(null);
      setPlanName("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPlanName("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!planName.trim()) {
      toast.error("Plan Name is required");
      return;
    }

    try {
      if (editId) {
        const resPut = await api.put(`api/food-plans/${editId}`, { plan_name: planName });
        if(!resPut) return;
        toast.success("Food Plan updated successfully");
      } else {
        const resPost = await api.post("api/food-plans", { plan_name: planName });
        if(!resPost) return;
        toast.success("Food Plan added successfully");
      }
      handleClose();
      fetchFoodPlans();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this food plan?")) {
      try {
        const resDel = await api.delete(`api/food-plans/${id}`);
        if(!resDel) return;
        toast.success("Food Plan deleted successfully");
        fetchFoodPlans();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Food Plans</Typography>
        <Button variant="contained" onClick={() => handleOpen()} color="primary">
          + Add New
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Plan Name</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {foodPlans.length > 0 ? (
              foodPlans.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.plan_name}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" color="primary" sx={{ mr: 1 }} onClick={() => handleOpen(row)}>
                      Edit
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(row.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">No Food Plans Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Food Plan" : "Add Food Plan"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Plan Name"
            type="text"
            fullWidth
            variant="outlined"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
