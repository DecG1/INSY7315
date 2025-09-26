import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from "@mui/material";
import { brandRed, lightPink } from "./helpers.js"; 

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Manager");

  // ✅ Safe handler to avoid undefined function errors
  const handleLogin = () => {
    const userData = { email, role };
    if (typeof onLogin === "function") {
      onLogin(userData);
    } else {
      console.log("Logged in:", userData);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 6,
        backgroundColor: lightPink,
      }}
    >
      <Card sx={{ width: 420, boxShadow: 8 }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 3 }}>
            <Avatar sx={{ bgcolor: brandRed, width: 48, height: 48, fontWeight: 800 }}>*</Avatar>
            <Typography variant="h6" fontWeight={800} color={brandRed}>
              Logo
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage your restaurant
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email / Username"
              placeholder="your.email@example.com"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              placeholder="**********"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Your Role</InputLabel>
              <Select
                label="Your Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleLogin}>
              Login
            </Button>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Button size="small">Forgot Password?</Button>
              <Button size="small">Don’t have an account? Register</Button>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              Or use biometric login on your phone
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
