import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Grid,
  Divider,
  Avatar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  AssignmentReturn as ReturnIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTheme, useMediaQuery } from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import InfoIcon from '@mui/icons-material/Info';

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/80x80?text=Product";

// Define matte black colors
const matteColors = {
  900: "#1a1a1a",
  800: "#2d2d2d",
  700: "#404040",
  600: "#525252",
  100: "#f5f5f5",
};

const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "approved":
      return <ApprovedIcon />;
    case "pending":
      return <PendingIcon />;
    case "rejected":
      return <RejectedIcon />;
    default:
      return <PendingIcon />;
  }
};

const statusColors = {
  pending: '#fffbe6', // light yellow
  approved: '#e3f2fd', // light blue
  completed: '#e8f5e9', // light green
};
const statusChipColors = {
  pending: 'warning',
  approved: 'info',
  completed: 'success',
};
const statusLabels = {
  pending: 'Requested',
  approved: 'Approved',
  completed: 'Completed',
};
const steps = ['Requested', 'Approved', 'Completed'];

const Returns = ({ mode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchReturns = async () => {
    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/user/returns`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReturns(response.data.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch returns."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReturns();
    }
  }, [user]);

  // Sort returns by date descending (newest first)
  const sortedReturns = [...returns].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  // Don't render anything if not logged in
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Container
        sx={{
          py: { xs: 4, md: 8 },
          bgcolor: mode === "dark" ? "#181818" : "#fff",
          color: mode === "dark" ? "#fff" : "#181818",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  const handleReturnCardClick = async (orderId) => {
    setOrderDialogOpen(true);
    setOrderLoading(true);
    setOrderError("");
    setOrderDetails(null);
    try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/orders/my/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrderDetails(response.data.data);
    } catch (err) {
      setOrderError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch order details."
      );
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCloseOrderDialog = () => {
    setOrderDialogOpen(false);
    setOrderDetails(null);
    setOrderError("");
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 4, md: 8 },
        bgcolor: mode === "dark" ? "#181818" : "#f7f9fa",
        color: mode === "dark" ? "#fff" : "#181818",
        minHeight: "100vh",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <Typography
        variant="h3"
        sx={{ fontWeight: 900, mb: 4, textAlign: "center", letterSpacing: 1 }}
      >
        My Returns
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="outlined"
          onClick={fetchReturns}
          startIcon={<RefreshIcon />}
          sx={{ borderRadius: 3, fontWeight: 600, px: 3 }}
        >
          Refresh Returns
        </Button>
      </Box>
      {sortedReturns.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <ReturnIcon sx={{ fontSize: 60, color: "#bdbdbd", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            No Returns Found
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            You have not requested any returns yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {sortedReturns.map((ret) => {
            // Determine status for stepper and color
            let stepIndex = 0;
            let cardBg = statusColors.pending;
            let chipColor = statusChipColors.pending;
            let chipLabel = statusLabels.pending;
            if (ret.status === 'approved') {
              stepIndex = 1;
              cardBg = statusColors.approved;
              chipColor = statusChipColors.approved;
              chipLabel = statusLabels.approved;
            }
            if (ret.received) {
              stepIndex = 2;
              cardBg = statusColors.completed;
              chipColor = statusChipColors.completed;
              chipLabel = statusLabels.completed;
            }
            return (
              <Grid item xs={12} sm={12} md={10} lg={8} key={ret._id} sx={{ mx: 'auto' }}>
                <Paper
                  elevation={2}
                  sx={{
                    borderRadius: 4,
                    p: 3,
                    bgcolor: cardBg,
                    boxShadow: '0 2px 12px rgba(60,60,60,0.07)',
                    minHeight: 220,
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: '#f5f5f5', border: '2px solid #e0e0e0' }}>
                        <Inventory2OutlinedIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {ret.productName || 'Product Name'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Order: <b>{ret.orderId}</b>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Return ID: <b>{ret._id}</b>
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={chipLabel}
                      color={chipColor}
                      icon={stepIndex === 2 ? <CheckCircleIcon /> : (stepIndex === 1 ? <InfoIcon /> : <PendingIcon />)}
                      sx={{ fontWeight: 600, fontSize: 15, borderRadius: 2, px: 1.5, py: 0.5 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Requested: {ret.date ? new Date(ret.date).toLocaleDateString() : ''}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
                    Reason: <span style={{ fontWeight: 700 }}>{ret.reason}</span>
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Stepper activeStep={stepIndex} alternativeLabel>
                      {steps.map((label) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Order Details Dialog */}
      <Dialog open={orderDialogOpen} onClose={handleCloseOrderDialog} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent dividers>
          {orderLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : orderError ? (
            <Alert severity="error">{orderError}</Alert>
          ) : orderDetails ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Order #{orderDetails._id}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Placed on: {new Date(orderDetails.createdAt).toLocaleDateString()}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Total: ₹{orderDetails.totalPrice}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Payment Type: {orderDetails.paymentInfo?.method?.toUpperCase() || 'N/A'}</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>Status: <Chip label={orderDetails.orderStatus} color={getStatusColor(orderDetails.orderStatus)} size="small" /></Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Order Items:</Typography>
              <List>
                {orderDetails.orderItems.map((item, idx) => (
                  <ListItem key={idx} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={item.image || PLACEHOLDER_IMAGE} alt={item.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.name}
                      secondary={`Qty: ${item.qty} | Price: ₹${item.price}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Delivery Address:</Typography>
              <Typography variant="body2">{orderDetails.shippingAddress?.address}, {orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.state}, {orderDetails.shippingAddress?.country}, {orderDetails.shippingAddress?.postalCode}</Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDialog} color="primary" variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Returns;
