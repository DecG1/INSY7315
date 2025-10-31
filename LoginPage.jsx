import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { authenticateUser } from "./userService.js";
import { setSession } from "./sessionService.js";
import { logLogin } from "./auditService.js";
import Logo from "./Logo.jsx"; // Import custom restaurant logo

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Authenticate user with email and password
      const user = await authenticateUser(email, password);
      
      if (!user) {
        // Log failed login attempt
        await logLogin(email, false);
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Create session with authenticated user data
      await setSession({ 
        email: user.email, 
        role: user.role,
        userId: user.id 
      });
      
      // Log successful login
      await logLogin(user.email, true);
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      // Force reload to trigger App to re-check session
      window.location.reload();
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
      setLoading(false);
    }
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
            Welcome Back
          </Typography>
          
          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 2, color: "#7f8c8d" }}
          >
            Sign in to access your dashboard
          </Typography>

          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />

              {error && (
                <Alert severity="error" sx={{ borderRadius: "10px" }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #8b0000 0%, #6f0000 100%)",
                  textTransform: "none",
                  fontSize: "16px",
                  boxShadow: "0 4px 15px rgba(139, 0, 0, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #6f0000 0%, #5a0000 100%)",
                    boxShadow: "0 6px 20px rgba(139, 0, 0, 0.4)",
                  },
                  "&:disabled": {
                    background: "#ccc",
                  },
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(139, 0, 0, 0.05)', borderRadius: '10px' }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              <strong>Default Credentials:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 0.5 }}>
              Owner: owner@marios.com / Owner@123
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Manager: assistantmanager@marios.com / Manager@123
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Staff: waiter@marios.com / Staff@123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
