import React, { useState } from "react";
import {
  Box, Card, CardContent, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem, Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { VERIFIED_USERS, REQUIRE_ACCESS_CODE } from "./config.js";
import { setSession } from "./sessionService.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Manager");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    const normalized = email.trim().toLowerCase();
    if (!VERIFIED_USERS.includes(normalized)) {
      setError("This user is not allowed to access the app.");
      return;
    }

    if (REQUIRE_ACCESS_CODE) {
      const required = import.meta.env.VITE_APP_ACCESS_CODE;
      if (!required || code !== required) {
        setError("Invalid access code.");
        return;
      }
    }

    await setSession({ email: normalized, role });
    navigate("/", { replace: true });
  };

  return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", p:6 }}>
      <Card sx={{ width: 420 }}>
        <CardContent sx={{ display:"flex", flexDirection:"column", gap:2 }}>
          <Typography variant="h5" fontWeight={700}>Welcome</Typography>
          <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <FormControl>
            <InputLabel>Your Role</InputLabel>
            <Select label="Your Role" value={role} onChange={e=>setRole(e.target.value)}>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
            </Select>
          </FormControl>
          {REQUIRE_ACCESS_CODE && (
            <TextField label="Access Code" value={code} onChange={e=>setCode(e.target.value)} />
          )}
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button variant="contained" onClick={handleLogin}>Enter</Button>
        </CardContent>
      </Card>
    </Box>
  );
}
