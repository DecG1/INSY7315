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
  Link,
} from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { authenticateUser, createUser } from "./userService.js";
import { setSession } from "./sessionService.js";
import { logLogin } from "./auditService.js";
import Logo from "./Logo.jsx"; // Import custom restaurant logo
import HintTooltip from "./HintTooltip.jsx";

export default function LoginPage({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
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

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Create new user (first user becomes admin, others become staff)
      await createUser(email, password, 'admin', name);
      
      // Auto-login after successful registration
      const user = await authenticateUser(email, password);
      
      if (user) {
        await setSession({ 
          email: user.email, 
          role: user.role,
          userId: user.id 
        });
        
        await logLogin(user.email, true);
        
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        window.location.reload();
      }
    } catch (err) {
      console.error("Sign up error:", err);
      if (err.message && err.message.includes("already exists")) {
        setError("An account with this email already exists.");
      } else {
        setError("An error occurred during registration. Please try again.");
      }
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setShowPassword(false);
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
            {isSignUp ? "Create Account" : "Welcome"}
          </Typography>
          
          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 2, color: "#64748b", fontWeight: 500 }}
          >
            {isSignUp ? "Sign up to get started" : "Sign in to your account"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {isSignUp && (
                <TextField
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoFocus={!isSignUp}
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
                helperText={isSignUp ? "Must be at least 8 characters" : ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <HintTooltip hint="Toggle password visibility">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </HintTooltip>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              {isSignUp && (
                <TextField
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              )}

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
                {loading ? (isSignUp ? "Creating Account..." : "Signing in...") : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMode();
                }}
                disabled={loading}
                sx={{
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
