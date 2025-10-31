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
            Welcome
          </Typography>
          
          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 2, color: "#64748b", fontWeight: 500 }}
          >
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoFocus
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  mt: 1,
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(139, 0, 0, 0.05)', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
              Default Accounts:
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Admin: admin@restaurant.com / Admin123!
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Manager: manager@restaurant.com / Manager123!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
