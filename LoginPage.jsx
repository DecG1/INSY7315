import React, { useState } from "react";
import { Box, Card, CardContent, Avatar, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { brandRed, lightPink } from "../utils/helpers";

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Manager");

  return (
    <Box className="min-h-screen flex items-center justify-center p-6" sx={{ backgroundColor: lightPink }}>
      <Card sx={{ width: 420, boxShadow: 8 }}>
        <CardContent className="p-6">
          <Box className="flex flex-col items-center gap-2 mb-4">
            <Avatar sx={{ bgcolor: brandRed, width: 48, height: 48, fontWeight: 800 }}>*</Avatar>
            <Typography variant="h6" fontWeight={800} color={brandRed}>logo</Typography>
            <Typography variant="h5" fontWeight={800}>Welcome back</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to manage your restaurant</Typography>
          </Box>
          <Box className="flex flex-col gap-3">
            <TextField label="Email / Username" placeholder="your.email@example.com" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Password" placeholder="**********" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel>Your Role</InputLabel>
              <Select label="Your Role" value={role} onChange={(e) => setRole(e.target.value)}>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={() => onLogin({ email, role })}>Login</Button>
            <Box className="flex items-center justify-between">
              <Button size="small">Forgot Password?</Button>
              <Button size="small">Don't have an account? Register</Button>
            </Box>
            <Typography variant="body2" color="text.secondary" className="text-center">Or use biometric login on your phone</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
