import React, { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon,
  RemoveRedEye as ViewIcon,
  ShoppingCart as ShoppingCartIcon,
  Download as DownloadIcon,
  Autorenew as ExchangeIcon,
  ReceiptLong as InvoiceIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useTheme, useMediaQuery } from "@mui/material";
import { useEffect } from "react";
import axios from "axios";
import PendingTimeIcon from "@mui/icons-material/AccessTime";
import ProcessingInventoryIcon from "@mui/icons-material/Inventory";
import MuiAlert from "@mui/material/Alert";
import { API_ENDPOINTS, buildApiUrl, handleApiError } from "../utils/api";

const getStatusColor = (status) => {
  switch (status) {
    case "delivered":
      return "success";
    case "shipped":
      return "info";
    case "processing":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "shipped":
      return <ShippingIcon />;
    case "delivered":
      return <DeliveredIcon />;
    case "cancelled":
      return <CancelledIcon />;
    default:
      return null;
  }
};

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/80x80?text=Product";

const trackingSteps = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

// Define matte black colors
const matteColors = {
  900: "#1a1a1a",
  800: "#2d2d2d",
  700: "#404040",
  600: "#525252",
  100: "#f5f5f5",
};

// Add statusStyles map
const statusStyles = {
  pending: { bg: "#ff9800", color: "#fff", icon: <PendingTimeIcon /> }, // orange
  confirmed: {
    bg: "#1976d2",
    color: "#fff",
    icon: <ProcessingInventoryIcon />,
  }, // blue
  shipped: { bg: "#181818", color: "#fff", icon: <ShippingIcon /> }, // black
  delivered: { bg: "#388e3c", color: "#fff", icon: <DeliveredIcon /> }, // green
  cancelled: { bg: "#d32f2f", color: "#fff", icon: <CancelledIcon /> }, // red
};

const Orders = ({ mode }) => {
  const navigate = useNavigate();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnItem, setReturnItem] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnComment, setReturnComment] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        buildApiUrl(API_ENDPOINTS.ORDERS_MY_ORDERS),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders(response.data.data || []);
    } catch (err) {
      const error = handleApiError(err);
      setError(error.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;

  const handleExpandToggle = (orderId) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setTrackOpen(true);
  };

  const handleClose = () => {
    setDetailsOpen(false);
    setTrackOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenReturnDialog = (orderId, item, idx) => {
    setReturnItem({ orderId, item, idx });
    setReturnReason("");
    setReturnComment("");
    setReturnDialogOpen(true);
  };

  const handleCloseReturnDialog = () => {
    setReturnDialogOpen(false);
    setReturnItem(null);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        buildApiUrl(API_ENDPOINTS.USER_RETURN_SUBMIT),
        {
          orderId: returnItem.orderId,
          productId: returnItem.item.product || returnItem.item._id,
          reason: returnReason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbarMsg("Return request submitted!");
      setSnackbarSeverity("success");
    } catch (err) {
      let msg = "Failed to submit return request.";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setSnackbarMsg(msg);
      setSnackbarSeverity("error");
    } finally {
      setReturnDialogOpen(false);
      setSnackbarOpen(true);
      setReturnItem(null);
      console.log("Snackbar should open now");
    }
  };

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 3, textAlign: "center" }}
        >
          My Orders
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ShoppingCartIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            You have no orders yet.
          </Typography>
          <Button variant="contained" color="primary" href="/products">
            Shop Now
          </Button>
        </Box>
      </Container>
    );
  }

  // Update all status displays to default to 'Pending' if order.status is missing or empty
  const getDisplayStatus = (status) => {
    return status && status.length > 0
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "Pending";
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 4, md: 8 },
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "#181818",
        minHeight: "100vh",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 2 }}>
        <Button variant="outlined" onClick={fetchOrders}>
          Refresh Orders
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate("/returns")}
          sx={{
            bgcolor: matteColors[900],
            color: "white",
            "&:hover": {
              bgcolor: matteColors[800],
            },
          }}
        >
          My Returns
        </Button>
      </Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, mb: 3, textAlign: "center" }}
      >
        My Orders
      </Typography>
      <Divider sx={{ mb: 4 }} />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        {orders.map((order) => {
          // Debug log for order and shippingAddress
          console.log("Order:", order);
          console.log("Shipping Address:", order.shippingAddress);
          return (
            <Grid item xs={12} key={order._id}>
              {isMobile ? (
                // --- MOBILE: Compact, expandable/collapsible card with item-level Return/Exchange ---
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    position: "relative",
                  }}
                >
                  {/* Arrow at top right */}
                  <Button
                    onClick={() => handleExpandToggle(order._id)}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      minWidth: 0,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      color: matteColors[900],
                      backgroundColor: matteColors[100],
                      boxShadow: "none",
                      zIndex: 2,
                      "&:hover": {
                        backgroundColor: matteColors[800],
                        color: "white",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {expandedOrders.includes(order._id) ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </Button>
                  {/* Order Date at the top */}
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontWeight: 600, mb: 1 }}
                  >
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                  {/* Product Thumbnails (always visible) */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      flex: 1,
                      mb: 2,
                    }}
                  >
                    {(expandedOrders.includes(order._id)
                      ? order.orderItems
                      : order.orderItems.slice(0, 2)
                    ).map((item, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          width: "100%",
                        }}
                      >
                        <Avatar
                          src={
                            item.image && item.image !== ""
                              ? item.image
                              : PLACEHOLDER_IMAGE
                          }
                          alt={item.name}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: "#fafafa",
                            border: "2px solid #e0e0e0",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: "text.primary",
                            flex: 1,
                            minWidth: 0,
                            pr: 1,
                            overflowWrap: "break-word",
                            whiteSpace: "normal",
                            fontSize: "0.9rem",
                          }}
                        >
                          {item.name}
                        </Typography>
                        {expandedOrders.includes(order._id) && (
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              ml: 1,
                              mr: 1,
                              borderRadius: 8,
                              fontSize: "0.82rem",
                              px: 1.2,
                              py: 0.4,
                              minWidth: 0,
                              minHeight: 32,
                              color: matteColors[900],
                              borderColor: matteColors[900],
                              backgroundColor: "white",
                              textTransform: "none",
                              boxShadow: "none",
                              whiteSpace: "nowrap",
                              "&:hover": {
                                backgroundColor: matteColors[100],
                                borderColor: matteColors[800],
                                color: matteColors[800],
                                boxShadow: "none",
                              },
                            }}
                            onClick={() =>
                              handleOpenReturnDialog(order._id, item, idx)
                            }
                          >
                            Return/Exchange
                          </Button>
                        )}
                      </Box>
                    ))}
                  </Box>
                  {/* Expanded content: order info and buttons */}
                  {expandedOrders.includes(order._id) && (
                    <>
                      {/* Order Info */}
                      <Box sx={{ mb: 2, mt: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: "text.secondary",
                            mb: 0.5,
                          }}
                        >
                          Order #{order._id}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mb: 0.5 }}
                        >
                          Total: <b>₹{order.totalPrice}</b>
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mb: 0.5 }}
                        >
                          Payment Type:{" "}
                          {order.paymentInfo?.method
                            ? order.paymentInfo.method.toUpperCase()
                            : "N/A"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mb: 0.5 }}
                        >
                          Delivery Address:{" "}
                          {order.shippingAddress ? (
                            <>
                              {order.shippingAddress.name && (
                                <>{order.shippingAddress.name}, </>
                              )}
                              {order.shippingAddress.address && (
                                <>{order.shippingAddress.address}, </>
                              )}
                              {order.shippingAddress.city && (
                                <>{order.shippingAddress.city}, </>
                              )}
                              {order.shippingAddress.state && (
                                <>{order.shippingAddress.state}, </>
                              )}
                              {order.shippingAddress.postalCode && (
                                <>{order.shippingAddress.postalCode}</>
                              )}
                              {order.shippingAddress.phone && (
                                <> ({order.shippingAddress.phone})</>
                              )}
                            </>
                          ) : (
                            "N/A"
                          )}
                        </Typography>
                        {order.status === "pending" || !order.status ? (
                          <Chip
                            label={getDisplayStatus(order.status)}
                            icon={statusStyles[order.status]?.icon}
                            sx={{
                              fontWeight: 600,
                              fontSize: "1rem",
                              px: 2,
                              py: 1,
                              mt: 1,
                              backgroundColor: statusStyles[order.status]?.bg,
                              color: statusStyles[order.status]?.color,
                              "& .MuiChip-icon": {
                                color: statusStyles[order.status]?.color,
                              },
                            }}
                          />
                        ) : order.status === "confirmed" ? (
                          <Chip
                            label={getDisplayStatus(order.status)}
                            icon={statusStyles[order.status]?.icon}
                            sx={{
                              fontWeight: 600,
                              fontSize: "1rem",
                              px: 2,
                              py: 1,
                              mt: 1,
                              backgroundColor: statusStyles[order.status]?.bg,
                              color: statusStyles[order.status]?.color,
                              "& .MuiChip-icon": {
                                color: statusStyles[order.status]?.color,
                              },
                            }}
                          />
                        ) : order.status === "shipped" ? (
                          <Chip
                            label={getDisplayStatus(order.status)}
                            icon={statusStyles[order.status]?.icon}
                            sx={{
                              fontWeight: 600,
                              fontSize: "1rem",
                              px: 2,
                              py: 1,
                              mt: 1,
                              backgroundColor: statusStyles[order.status]?.bg,
                              color: statusStyles[order.status]?.color,
                              "& .MuiChip-icon": {
                                color: statusStyles[order.status]?.color,
                              },
                            }}
                          />
                        ) : (
                          <Chip
                            label={getDisplayStatus(order.status)}
                            color={getStatusColor(order.status)}
                            icon={getStatusIcon(order.status)}
                            sx={{
                              fontWeight: 600,
                              fontSize: "1rem",
                              px: 2,
                              py: 1,
                              mt: 1,
                            }}
                          />
                        )}
                      </Box>
                      {/* Action Buttons */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                          flexWrap: "wrap",
                          mt: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          sx={{
                            fontWeight: 600,
                            minWidth: 120,
                            borderColor: matteColors[900],
                            color: matteColors[900],
                            backgroundColor: "white",
                            py: { xs: 0.7, md: 1 },
                            px: { xs: 2, md: 3 },
                            fontSize: { xs: "0.92rem", md: "0.98rem" },
                            borderRadius: 10,
                            minHeight: { xs: 36, md: 42 },
                            textTransform: "none",
                            alignSelf: { xs: "stretch", md: "center" },
                            whiteSpace: "nowrap",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            "&:hover": {
                              backgroundColor: matteColors[100],
                              borderColor: matteColors[800],
                              color: matteColors[800],
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
                            },
                          }}
                          onClick={() => handleViewDetails(order)}
                          fullWidth={isMobile}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<ShippingIcon />}
                          sx={{
                            backgroundColor: matteColors[900],
                            color: "white",
                            fontWeight: 600,
                            minWidth: 120,
                            py: { xs: 0.7, md: 1 },
                            px: { xs: 2, md: 3 },
                            fontSize: { xs: "0.92rem", md: "0.98rem" },
                            borderRadius: 10,
                            minHeight: { xs: 36, md: 42 },
                            textTransform: "none",
                            alignSelf: { xs: "stretch", md: "center" },
                            whiteSpace: "nowrap",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            "&:hover": {
                              backgroundColor: matteColors[800],
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            },
                          }}
                          onClick={() => handleTrackOrder(order)}
                          fullWidth={isMobile}
                        >
                          Track Order
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<ExchangeIcon />}
                          sx={{
                            backgroundColor: matteColors[900],
                            color: "white",
                            fontWeight: 600,
                            minWidth: 170,
                            py: { xs: 0.7, md: 1 },
                            px: { xs: 2, md: 3 },
                            fontSize: { xs: "0.92rem", md: "0.98rem" },
                            borderRadius: 10,
                            minHeight: { xs: 36, md: 42 },
                            textTransform: "none",
                            alignSelf: { xs: "stretch", md: "center" },
                            whiteSpace: "nowrap",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            "&:hover": {
                              backgroundColor: matteColors[800],
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            },
                          }}
                          onClick={() =>
                            handleOpenReturnDialog(
                              order._id,
                              order.orderItems[0],
                              0
                            )
                          }
                          fullWidth={isMobile}
                        >
                          Return
                        </Button>
                      </Box>
                    </>
                  )}
                </Paper>
              ) : (
                // --- DESKTOP: Original always-expanded card, no expand/collapse, no item-level Return/Exchange ---
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 2.5, sm: 4 },
                    borderRadius: 3,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                  }}
                >
                  {/* Order Summary */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { sm: "center" },
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: "text.secondary",
                          mb: 0.5,
                        }}
                      >
                        Order #{order._id}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 0.5 }}
                      >
                        Placed on:{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 0.5 }}
                      >
                        Total: <b>₹{order.totalPrice}</b>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 0.5 }}
                      >
                        Payment Type:{" "}
                        {order.paymentInfo?.method
                          ? order.paymentInfo.method.toUpperCase()
                          : "N/A"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 0.5 }}
                      >
                        Delivery Address:{" "}
                        {order.shippingAddress ? (
                          <>
                            {order.shippingAddress.name && (
                              <>{order.shippingAddress.name}, </>
                            )}
                            {order.shippingAddress.address && (
                              <>{order.shippingAddress.address}, </>
                            )}
                            {order.shippingAddress.city && (
                              <>{order.shippingAddress.city}, </>
                            )}
                            {order.shippingAddress.state && (
                              <>{order.shippingAddress.state}, </>
                            )}
                            {order.shippingAddress.postalCode && (
                              <>{order.shippingAddress.postalCode}</>
                            )}
                            {order.shippingAddress.phone && (
                              <> ({order.shippingAddress.phone})</>
                            )}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </Typography>
                    </Box>
                    {order.status === "pending" || !order.status ? (
                      <Chip
                        label={getDisplayStatus(order.status)}
                        icon={statusStyles[order.status]?.icon}
                        sx={{
                          fontWeight: 600,
                          fontSize: "1rem",
                          px: 2,
                          py: 1,
                          mt: { xs: 2, sm: 0 },
                          backgroundColor: statusStyles[order.status]?.bg,
                          color: statusStyles[order.status]?.color,
                          "& .MuiChip-icon": {
                            color: statusStyles[order.status]?.color,
                          },
                        }}
                      />
                    ) : order.status === "confirmed" ? (
                      <Chip
                        label={getDisplayStatus(order.status)}
                        icon={statusStyles[order.status]?.icon}
                        sx={{
                          fontWeight: 600,
                          fontSize: "1rem",
                          px: 2,
                          py: 1,
                          mt: { xs: 2, sm: 0 },
                          backgroundColor: statusStyles[order.status]?.bg,
                          color: statusStyles[order.status]?.color,
                          "& .MuiChip-icon": {
                            color: statusStyles[order.status]?.color,
                          },
                        }}
                      />
                    ) : order.status === "shipped" ? (
                      <Chip
                        label={getDisplayStatus(order.status)}
                        icon={statusStyles[order.status]?.icon}
                        sx={{
                          fontWeight: 600,
                          fontSize: "1rem",
                          px: 2,
                          py: 1,
                          mt: { xs: 2, sm: 0 },
                          backgroundColor: statusStyles[order.status]?.bg,
                          color: statusStyles[order.status]?.color,
                          "& .MuiChip-icon": {
                            color: statusStyles[order.status]?.color,
                          },
                        }}
                      />
                    ) : (
                      <Chip
                        label={getDisplayStatus(order.status)}
                        color={getStatusColor(order.status)}
                        icon={getStatusIcon(order.status)}
                        sx={{
                          fontWeight: 600,
                          fontSize: "1rem",
                          px: 2,
                          py: 1,
                          mt: { xs: 2, sm: 0 },
                        }}
                      />
                    )}
                  </Box>
                  {/* Product Thumbnails (all items) */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                      mb: 1,
                    }}
                  >
                    {order.orderItems.map((item, idx) => (
                      <Box
                        key={idx}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          src={item.image || PLACEHOLDER_IMAGE}
                          alt={item.name}
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: "#fafafa",
                            border: "1px solid #eee",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: "text.primary",
                            maxWidth: 100,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  {/* Action Buttons */}
                  <Box
                    sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      sx={{
                        fontWeight: 600,
                        minWidth: 120,
                        borderColor: matteColors[900],
                        color: matteColors[900],
                        backgroundColor: "white",
                        py: { xs: 0.7, md: 1 },
                        px: { xs: 2, md: 3 },
                        fontSize: { xs: "0.92rem", md: "0.98rem" },
                        borderRadius: 10,
                        minHeight: { xs: 36, md: 42 },
                        textTransform: "none",
                        alignSelf: "center",
                        whiteSpace: "nowrap",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        "&:hover": {
                          backgroundColor: matteColors[100],
                          borderColor: matteColors[800],
                          color: matteColors[800],
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
                        },
                      }}
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ShippingIcon />}
                      sx={{
                        backgroundColor: matteColors[900],
                        color: "white",
                        fontWeight: 600,
                        minWidth: 120,
                        py: { xs: 0.7, md: 1 },
                        px: { xs: 2, md: 3 },
                        fontSize: { xs: "0.92rem", md: "0.98rem" },
                        borderRadius: 10,
                        minHeight: { xs: 36, md: 42 },
                        textTransform: "none",
                        alignSelf: "center",
                        whiteSpace: "nowrap",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        "&:hover": {
                          backgroundColor: matteColors[800],
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        },
                      }}
                      onClick={() => handleTrackOrder(order)}
                    >
                      Track Order
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ExchangeIcon />}
                      sx={{
                        backgroundColor: matteColors[900],
                        color: "white",
                        fontWeight: 600,
                        minWidth: 170,
                        py: { xs: 0.7, md: 1 },
                        px: { xs: 2, md: 3 },
                        fontSize: { xs: "0.92rem", md: "0.98rem" },
                        borderRadius: 10,
                        minHeight: { xs: 36, md: 42 },
                        textTransform: "none",
                        alignSelf: "center",
                        whiteSpace: "nowrap",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        "&:hover": {
                          backgroundColor: matteColors[800],
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        },
                      }}
                      onClick={() =>
                        handleOpenReturnDialog(
                          order._id,
                          order.orderItems[0],
                          0
                        )
                      }
                    >
                      Return
                    </Button>
                  </Box>
                </Paper>
              )}
            </Grid>
          );
        })}
      </Grid>

      {/* View Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Order #{selectedOrder._id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Placed on:{" "}
                {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Delivery Address:{" "}
                {selectedOrder.shippingAddress ? (
                  <>
                    {selectedOrder.shippingAddress.name && (
                      <>{selectedOrder.shippingAddress.name}, </>
                    )}
                    {selectedOrder.shippingAddress.address && (
                      <>{selectedOrder.shippingAddress.address}, </>
                    )}
                    {selectedOrder.shippingAddress.city && (
                      <>{selectedOrder.shippingAddress.city}, </>
                    )}
                    {selectedOrder.shippingAddress.state && (
                      <>{selectedOrder.shippingAddress.state}, </>
                    )}
                    {selectedOrder.shippingAddress.postalCode && (
                      <>{selectedOrder.shippingAddress.postalCode}</>
                    )}
                    {selectedOrder.shippingAddress.phone && (
                      <> ({selectedOrder.shippingAddress.phone})</>
                    )}
                  </>
                ) : (
                  "N/A"
                )}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Products
              </Typography>
              {selectedOrder.orderItems.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
                >
                  <Avatar
                    src={item.image || PLACEHOLDER_IMAGE}
                    alt={item.name}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "#fafafa",
                      border: "1px solid #eee",
                    }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Qty: {item.qty} | Price: ₹{item.price}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Total: ₹{selectedOrder.totalPrice}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                Status:{" "}
                {selectedOrder.status === "pending" || !selectedOrder.status ? (
                  <Chip
                    label={getDisplayStatus(selectedOrder.status)}
                    icon={statusStyles[selectedOrder.status]?.icon}
                    size="small"
                    sx={{
                      backgroundColor: statusStyles[selectedOrder.status]?.bg,
                      color: statusStyles[selectedOrder.status]?.color,
                      "& .MuiChip-icon": {
                        color: statusStyles[selectedOrder.status]?.color,
                      },
                    }}
                  />
                ) : selectedOrder.status === "confirmed" ? (
                  <Chip
                    label={getDisplayStatus(selectedOrder.status)}
                    icon={statusStyles[selectedOrder.status]?.icon}
                    size="small"
                    sx={{
                      backgroundColor: statusStyles[selectedOrder.status]?.bg,
                      color: statusStyles[selectedOrder.status]?.color,
                      "& .MuiChip-icon": {
                        color: statusStyles[selectedOrder.status]?.color,
                      },
                    }}
                  />
                ) : selectedOrder.status === "shipped" ? (
                  <Chip
                    label={getDisplayStatus(selectedOrder.status)}
                    icon={statusStyles[selectedOrder.status]?.icon}
                    size="small"
                    sx={{
                      backgroundColor: statusStyles[selectedOrder.status]?.bg,
                      color: statusStyles[selectedOrder.status]?.color,
                      "& .MuiChip-icon": {
                        color: statusStyles[selectedOrder.status]?.color,
                      },
                    }}
                  />
                ) : (
                  <Chip
                    label={getDisplayStatus(selectedOrder.status)}
                    color={getStatusColor(selectedOrder.status)}
                    size="small"
                    icon={getStatusIcon(selectedOrder.status)}
                  />
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              backgroundColor: matteColors[900],
              color: "white",
              fontWeight: 600,
              borderRadius: 10,
              py: { xs: 0.7, md: 1 },
              px: { xs: 2, md: 3 },
              fontSize: { xs: "0.92rem", md: "0.98rem" },
              minHeight: { xs: 36, md: 42 },
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: matteColors[800],
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Track Order Dialog */}
      <Dialog open={trackOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Track Order</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Stepper
                activeStep={
                  selectedOrder.status === "delivered"
                    ? 4
                    : selectedOrder.status === "shipped"
                      ? 2
                      : selectedOrder.status === "processing"
                        ? 1
                        : 0
                }
                orientation="vertical"
              >
                {trackingSteps.map((label, idx) => (
                  <Step
                    key={label}
                    completed={
                      (selectedOrder.status === "delivered" && idx <= 4) ||
                      (selectedOrder.status === "shipped" && idx <= 2) ||
                      (selectedOrder.status === "processing" && idx <= 1)
                    }
                  >
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Current Status:{" "}
                  {selectedOrder.status === "pending" ||
                  !selectedOrder.status ? (
                    <Chip
                      label={getDisplayStatus(selectedOrder.status)}
                      icon={statusStyles[selectedOrder.status]?.icon}
                      size="small"
                      sx={{
                        backgroundColor: statusStyles[selectedOrder.status]?.bg,
                        color: statusStyles[selectedOrder.status]?.color,
                        "& .MuiChip-icon": {
                          color: statusStyles[selectedOrder.status]?.color,
                        },
                      }}
                    />
                  ) : selectedOrder.status === "confirmed" ? (
                    <Chip
                      label={getDisplayStatus(selectedOrder.status)}
                      icon={statusStyles[selectedOrder.status]?.icon}
                      size="small"
                      sx={{
                        backgroundColor: statusStyles[selectedOrder.status]?.bg,
                        color: statusStyles[selectedOrder.status]?.color,
                        "& .MuiChip-icon": {
                          color: statusStyles[selectedOrder.status]?.color,
                        },
                      }}
                    />
                  ) : selectedOrder.status === "shipped" ? (
                    <Chip
                      label={getDisplayStatus(selectedOrder.status)}
                      icon={statusStyles[selectedOrder.status]?.icon}
                      size="small"
                      sx={{
                        backgroundColor: statusStyles[selectedOrder.status]?.bg,
                        color: statusStyles[selectedOrder.status]?.color,
                        "& .MuiChip-icon": {
                          color: statusStyles[selectedOrder.status]?.color,
                        },
                      }}
                    />
                  ) : (
                    <Chip
                      label={getDisplayStatus(selectedOrder.status)}
                      color={getStatusColor(selectedOrder.status)}
                      size="small"
                      icon={getStatusIcon(selectedOrder.status)}
                    />
                  )}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              backgroundColor: matteColors[900],
              color: "white",
              fontWeight: 600,
              borderRadius: 10,
              py: { xs: 0.7, md: 1 },
              px: { xs: 2, md: 3 },
              fontSize: { xs: "0.92rem", md: "0.98rem" },
              minHeight: { xs: 36, md: 42 },
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: matteColors[800],
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return/Exchange Dialog */}
      <Dialog
        open={returnDialogOpen}
        onClose={handleCloseReturnDialog}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleSubmitReturn}>
          <DialogTitle>Return - {returnItem?.item?.name}</DialogTitle>
          <DialogContent dividers>
            <TextField
              select
              label="Reason"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="Wrong size">Wrong size</MenuItem>
              <MenuItem value="Damaged">Damaged</MenuItem>
              <MenuItem value="Not as described">Not as described</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              label="Additional Comments"
              value={returnComment}
              onChange={(e) => setReturnComment(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReturnDialog} color="primary">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!returnReason}
            >
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 2000 }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default Orders;
