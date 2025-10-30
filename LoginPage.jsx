import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { VERIFIED_USERS, REQUIRE_ACCESS_CODE } from "./config.js";
import { setSession } from "./sessionService.js";
import Logo from "./Logo.jsx"; // Import custom restaurant logo

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Manager");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

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
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    // Force reload to trigger App to re-check session
    window.location.reload();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8ebef 100%)",
        p: 3,
      }}
    >
      <Card
        sx={{
          width: 440,
          borderRadius: "16px",
          boxShadow: "0 6px 30px rgba(0, 0, 0, 0.12)",
          animation: "fadeIn 0.6s ease-in-out",
          "@keyframes fadeIn": {
            from: {
              opacity: 0,
              transform: "translateY(30px)",
            },
            to: {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            p: 4,
          }}
        >
          {/* Restaurant Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Logo size={80} />
          </Box>
          
          <Typography
            variant="h4"
            fontWeight={700}
            align="center"
            sx={{ mb: 1, color: "#2c3e50", letterSpacing: "-0.5px" }}
          >
            Welcome
          </Typography>
          
          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 2, color: "#7f8c8d" }}
          >
            Sign in to access your dashboard
          </Typography>

          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Your Role</InputLabel>
            <Select
              label="Your Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              sx={{
                borderRadius: "12px",
              }}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
            </Select>
          </FormControl>

          {REQUIRE_ACCESS_CODE && (
            <TextField
              label="Access Code"
              type="password"
              variant="outlined"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />
          )}

          {error && (
            <Typography
              variant="body2"
              color="error"
              align="center"
              sx={{
                mt: 1,
                p: 1.5,
                bgcolor: "#ffebee",
                borderRadius: "8px",
              }}
            >
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            size="large"
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: 600,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0078d7 0%, #005fa3 100%)",
              textTransform: "none",
              fontSize: "16px",
              boxShadow: "0 4px 15px rgba(0, 120, 215, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #005fa3 0%, #004578 100%)",
                boxShadow: "0 6px 20px rgba(0, 120, 215, 0.4)",
              },
            }}
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
