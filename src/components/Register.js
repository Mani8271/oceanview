import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper, CircularProgress } from "@mui/material";
import { registerInitiate } from "../redux/actions/registerAction";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isRegistered } = useSelector((state) => state.register);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState("admin");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== password_confirmation) {
      alert("Passwords do not match");
      return;
    }
    if (phone_number.length !== 10) {
      alert("Mobile number must be exactly 10 digits");
      return;
    }
    const userData = { username, name, email, phone_number, password, password_confirmation, role };
    dispatch(registerInitiate(userData, navigate)); // ✅ Using Redux Action
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Register
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextField
          label="Phone Number"
          fullWidth
          margin="normal"
          value={phone_number}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 10) setPhoneNumber(val);
          }}
          inputProps={{ maxLength: 10 }}
          required
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={password_confirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />

        <Button
          variant="contained"
          type="submit"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {isRegistered && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          Registered successfully 🎉 Redirecting to login...
        </Typography>
      )}
    </Paper>
  );
}
