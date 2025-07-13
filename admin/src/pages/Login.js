import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../context/AuthContext";
import ConnectionTest from "../components/common/ConnectionTest";
import ToastDemo from "../components/common/ToastDemo";
import { showError } from "../utils/toast";
import {
  sendAdminForgotPasswordOTP,
  verifyAdminForgotPasswordOTP,
  resetAdminPassword,
} from "../api/forgotPasswordAPI";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password Dialog States
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");
  // Store resetToken after OTP verification
  const [resetToken, setResetToken] = useState("");

  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from?.pathname || "/";

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  // Handle forgot password dialog open
  const handleForgotPasswordOpen = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordStep(1);
    setForgotPasswordEmail("");
    setForgotPasswordOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
  };

  // Handle forgot password dialog close
  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordStep(1);
    setForgotPasswordEmail("");
    setForgotPasswordOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
  };

  // Handle send OTP for forgot password
  const handleForgotPasswordSendOtp = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(forgotPasswordEmail)) {
      setForgotPasswordError("Please enter a valid email address.");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError("");
    setForgotPasswordSuccess("");

    try {
      const response = await sendAdminForgotPasswordOTP(forgotPasswordEmail);

      setForgotPasswordSuccess("OTP sent successfully! Check your email.");
      setForgotPasswordStep(2);
      showError("OTP sent to your email!", "success");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to send OTP. Please try again.";
      setForgotPasswordError(errorMessage);
      showError(errorMessage, "error");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Handle verify OTP for forgot password
  const handleForgotPasswordVerifyOtp = async () => {
    if (!forgotPasswordOtp) {
      setForgotPasswordError("Please enter the OTP.");
      return;
    }

    if (forgotPasswordOtp.length !== 6) {
      setForgotPasswordError("Please enter a 6-digit OTP.");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError("");

    try {
      const response = await verifyAdminForgotPasswordOTP(
        forgotPasswordEmail,
        forgotPasswordOtp
      );
      setResetToken(response.resetToken); // Store resetToken
      setForgotPasswordStep(3);
      showError("OTP verified successfully!", "success");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Invalid OTP. Please try again.";
      setForgotPasswordError(errorMessage);
      showError(errorMessage, "error");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!newPassword) {
      setForgotPasswordError("Please enter a new password.");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setForgotPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotPasswordError("Passwords do not match.");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError("");

    try {
      const response = await resetAdminPassword(
        forgotPasswordEmail,
        resetToken,
        newPassword
      );
      showError("Password reset successfully!", "success");
      handleForgotPasswordClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setForgotPasswordError(errorMessage);
      showError(errorMessage, "error");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData);
      // Navigate to the intended destination or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      // Removed showError(errorMessage) here to avoid duplicate toasts
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      {/* //  <ConnectionTest /> */}
      {/* <ToastDemo /> */}
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <img
            src="/logo.png"
            alt="BEATEN"
            style={{ width: "150px", marginBottom: "2rem" }}
          />

          <Typography component="h1" variant="h5" gutterBottom>
            Admin Login
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Use the following credentials to login:
            <br />
            <strong>Email:</strong> admin@beaten.com
            <br />
            <strong>Password:</strong> Admin123!
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>

            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Button
                variant="text"
                onClick={handleForgotPasswordOpen}
                sx={{
                  color: "text.secondary",
                  textTransform: "none",
                  fontSize: "0.875rem",
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                  },
                }}
              >
                Forgot password?
              </Button>
            </Box>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#000000",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Register Now
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={handleForgotPasswordClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
            {forgotPasswordStep === 1 && "Admin Forgot Password"}
            {forgotPasswordStep === 2 && "Enter OTP"}
            {forgotPasswordStep === 3 && "Reset Password"}
          </Typography>
          <IconButton onClick={handleForgotPasswordClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {forgotPasswordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {forgotPasswordError}
            </Alert>
          )}
          {forgotPasswordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {forgotPasswordSuccess}
            </Alert>
          )}

          {/* Step 1: Email Input */}
          {forgotPasswordStep === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your admin email address and we'll send you a one-time
                password to reset your account.
              </Typography>
              <TextField
                fullWidth
                label="Admin Email Address"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}

          {/* Step 2: OTP Input */}
          {forgotPasswordStep === 2 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We've sent a 6-digit OTP to{" "}
                <strong>{forgotPasswordEmail}</strong>. Please enter it below.
              </Typography>
              <TextField
                fullWidth
                label="Enter OTP"
                value={forgotPasswordOtp}
                onChange={(e) => setForgotPasswordOtp(e.target.value)}
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}

          {/* Step 3: New Password */}
          {forgotPasswordStep === 3 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create a new password for your admin account.
              </Typography>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ color: "action.active", mr: 1 }} />
                  ),
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ color: "action.active", mr: 1 }} />
                  ),
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          {forgotPasswordStep > 1 && (
            <Button
              onClick={() => setForgotPasswordStep(forgotPasswordStep - 1)}
              sx={{
                color: "#525252",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Back
            </Button>
          )}

          <Button
            onClick={
              forgotPasswordStep === 1
                ? handleForgotPasswordSendOtp
                : forgotPasswordStep === 2
                  ? handleForgotPasswordVerifyOtp
                  : handleResetPassword
            }
            variant="contained"
            disabled={forgotPasswordLoading}
            sx={{
              backgroundColor: "#1a1a1a",
              color: "white",
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#2d2d2d",
              },
            }}
          >
            {forgotPasswordLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : forgotPasswordStep === 1 ? (
              "Send OTP"
            ) : forgotPasswordStep === 2 ? (
              "Verify OTP"
            ) : (
              "Reset Password"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Login;
