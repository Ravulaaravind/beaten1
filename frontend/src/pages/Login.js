import React, { useState } from "react";

import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  ButtonGroup,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
  sendOtpLogin,
  verifyOtpLogin,
} from "../api/forgotPasswordAPI";

const Login = () => {
  const { login, error, loading, setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

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

  // Remove tab logic
  // const [tab, setTab] = useState(0);
  // const handleTabChange = ...

  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpVerify, setOtpVerify] = useState("");
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [otpVerifyError, setOtpVerifyError] = useState("");
  const [loginMode, setLoginMode] = useState("email"); // "email" or "otp"

  const from = location.state?.from?.pathname || "/";

  const matteColors = {
    900: "#1a1a1a",
    800: "#2d2d2d",
    700: "#404040",
    600: "#525252",
    100: "#f5f5f5",
  };

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
      const response = await sendForgotPasswordOTP(forgotPasswordEmail);

      setForgotPasswordSuccess("OTP sent successfully! Check your email.");
      setForgotPasswordStep(2);
      toast.success("OTP sent to your email!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to send OTP. Please try again.";
      setForgotPasswordError(errorMessage);
      toast.error(errorMessage);
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
      const response = await verifyForgotPasswordOTP(
        forgotPasswordEmail,
        forgotPasswordOtp
      );
      setResetToken(response.resetToken); // Store resetToken
      setForgotPasswordStep(3);
      toast.success("OTP verified successfully!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Invalid OTP. Please try again.";
      setForgotPasswordError(errorMessage);
      toast.error(errorMessage);
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
      const response = await resetPassword(
        forgotPasswordEmail,
        resetToken,
        newPassword
      );
      toast.success("Password reset successfully!");
      handleForgotPasswordClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setForgotPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Add handleChange and handleSubmit for the main login form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    const result = await login(form);
    if (result.success) {
      navigate("/");
    } else {
      setLocalError(result.message || "Login failed");
    }
  };

  // Send OTP for login
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpLoading(true);
    toast.info("Sending OTP...");
    if (!otpInput) {
      setOtpError("Please enter your email or phone number.");
      setOtpLoading(false);
      toast.error("Please enter your email or phone number.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/;
    let payload = {};
    if (emailRegex.test(otpInput)) {
      payload.email = otpInput;
    } else if (phoneRegex.test(otpInput)) {
      payload.phone = otpInput;
    } else {
      setOtpError("Enter a valid email or phone number.");
      setOtpLoading(false);
      toast.error("Enter a valid email or phone number.");
      return;
    }
    try {
      const response = await sendOtpLogin(payload);
      toast.success(response.message || "OTP sent successfully!");
      setOtpSent(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to send OTP. Please try again.";
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP for login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpVerifyError("");
    setOtpVerifyLoading(true);
    toast.info("Verifying OTP...");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/;
    let payload = {};
    if (emailRegex.test(otpInput)) {
      payload.email = otpInput;
    } else if (phoneRegex.test(otpInput)) {
      payload.phone = otpInput;
    }
    payload.otp = otpVerify;
    if (!otpVerify || otpVerify.length !== 6) {
      setOtpVerifyError("Please enter the 6-digit OTP.");
      setOtpVerifyLoading(false);
      toast.error("Please enter the 6-digit OTP.");
      return;
    }
    try {
      const response = await verifyOtpLogin(payload);
      toast.success(response.message || "OTP verified. Login successful.");
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      navigate("/");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to verify OTP. Please try again.";
      setOtpVerifyError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  // Add toasts for switching login modes and form resets
  const handleSwitchLoginMode = (mode) => {
    setLoginMode(mode);
    setOtpInput("");
    setOtpError("");
    setOtpSent(false);
    setOtpVerify("");
    setOtpVerifyError("");
    setOtpLoading(false);
    setOtpVerifyLoading(false);
    toast.info(
      mode === "email" ? "Switched to Email Login" : "Switched to OTP Login"
    );
  };

  return (
    <Container maxWidth="sm">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 700 }}>
          Welcome Back
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
          Enter your email or phone to continue
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <ButtonGroup variant="text" sx={{ boxShadow: "none" }}>
            <Button
              onClick={() => handleSwitchLoginMode("email")}
              sx={{
                fontWeight: 600,
                fontSize: 16,
                borderBottom:
                  loginMode === "email"
                    ? "3px solid #1a1a1a"
                    : "3px solid transparent",
                borderRadius: 0,
                color: loginMode === "email" ? "#1a1a1a" : "#888",
                background: "none",
                boxShadow: "none",
                px: 4,
              }}
              disableRipple
            >
              Email Login
            </Button>
            <Button
              onClick={() => handleSwitchLoginMode("otp")}
              sx={{
                fontWeight: 600,
                fontSize: 16,
                borderBottom:
                  loginMode === "otp"
                    ? "3px solid #1a1a1a"
                    : "3px solid transparent",
                borderRadius: 0,
                color: loginMode === "otp" ? "#1a1a1a" : "#888",
                background: "none",
                boxShadow: "none",
                px: 4,
              }}
              disableRipple
            >
              OTP Login
            </Button>
          </ButtonGroup>
        </Box>
        {loginMode === "email" && (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Email Login
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
              />
              {(localError || error) && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {localError || error}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  mt: 2,
                  borderRadius: 5,
                  fontWeight: 700,
                  fontSize: 18,
                  py: 1.5,
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Login"}
              </Button>
              <Box sx={{ textAlign: "right", mb: 2 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleForgotPasswordOpen}
                  sx={{ cursor: "pointer" }}
                >
                  Forgot password?
                </Link>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link component={RouterLink} to="/register">
                  Register here
                </Link>
              </Typography>
            </Box>
          </Paper>
        )}
        {loginMode === "otp" && (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              OTP Login
            </Typography>
            {!otpSent ? (
              <Box component="form" onSubmit={handleSendOtp}>
                <TextField
                  label="Email or Phone"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <PhoneIphoneIcon sx={{ color: "action.active", mr: 1 }} />
                    ),
                    sx: { borderRadius: 3, fontSize: 18 },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      fontSize: 18,
                    },
                  }}
                />
                {otpError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {otpError}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    mt: 2,
                    borderRadius: 5,
                    fontWeight: 700,
                    fontSize: 18,
                    py: 1.5,
                  }}
                  disabled={otpLoading}
                >
                  {otpLoading ? <CircularProgress size={24} /> : "Send OTP"}
                </Button>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 3 }}
                >
                  Don't have an account?{" "}
                  <Link component={RouterLink} to="/register">
                    Register here
                  </Link>
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleVerifyOtp}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Enter the 6-digit OTP sent to your{" "}
                  {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpInput)
                    ? "email"
                    : "phone"}
                  .
                </Typography>
                <TextField
                  label="Enter OTP"
                  value={otpVerify}
                  onChange={(e) => setOtpVerify(e.target.value)}
                  inputProps={{ maxLength: 6 }}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <LockIcon sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                {otpVerifyError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {otpVerifyError}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    mt: 2,
                    borderRadius: 5,
                    fontWeight: 700,
                    fontSize: 18,
                    py: 1.5,
                  }}
                  disabled={otpVerifyLoading}
                >
                  {otpVerifyLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Verify OTP & Login"
                  )}
                </Button>
              </Box>
            )}
          </Paper>
        )}
      </Box>
      {/* Forgot Password Dialog (unchanged) */}
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
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: matteColors[900] }}
          >
            {forgotPasswordStep === 1 && "Forgot Password"}
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
                Enter your email address and we'll send you a one-time password
                to reset your account.
              </Typography>
              <TextField
                fullWidth
                label="Email Address"
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
                Create a new password for your account.
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
                color: matteColors[700],
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
              backgroundColor: matteColors[900],
              color: "white",
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: matteColors[800],
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
};

export default Login;
