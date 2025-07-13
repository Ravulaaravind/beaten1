import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  Badge,
  Avatar,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  DialogContentText,
  ListItemIcon,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Download as DownloadIcon,
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
  Person as CustomerIcon,
  ShoppingCart as CartIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Update as UpdateIcon,
  History as HistoryIcon,
  PendingActions as PendingIcon,
  Sync as ProcessingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as PendingTimeIcon,
  Inventory as ProcessingInventoryIcon,
  LocalShipping as ShippedIcon,
  TaskAlt as DeliveredIcon,
  Cancel as CancelledIcon,
  FileDownload as ExportIcon,
  Visibility as ViewDetailsIcon,
  Edit as EditStatusIcon,
  History as ViewHistoryIcon,
} from "@mui/icons-material";
import { formatPrice } from "../utils/format";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

// Change validation to lowercase

const sortOptions = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "total_desc", label: "Highest Amount" },
  { value: "total_asc", label: "Lowest Amount" },
  { value: "status", label: "Status" },
];

function Orders() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortBy, setSortBy] = useState("date_desc");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [totalRange, setTotalRange] = useState({ min: "", max: "" });
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [orders, setOrders] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [dialogUpdating, setDialogUpdating] = useState(false);

  // Define orderStatuses inside the component to access the imported icons
  const orderStatuses = [
    { value: "pending", color: "warning", icon: <PendingTimeIcon /> },
    { value: "confirmed", color: "info", icon: <ProcessingInventoryIcon /> },
    { value: "shipped", color: "primary", icon: <ShippedIcon /> },
    { value: "delivered", color: "success", icon: <DeliveredIcon /> },
    { value: "cancelled", color: "error", icon: <CancelledIcon /> },
  ];

  // Helper to fetch user name by userId
  const fetchUserName = useCallback(
    async (userId) => {
      if (!userId || userNames[userId]) return;
      setLoadingUsers(true);
      try {
        const apiUrl =
          process.env.REACT_APP_API_URL || "http://localhost:8000/api";
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiUrl}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Store the full user object (name, email, etc.)
        setUserNames((prev) => ({
          ...prev,
          [userId]: res.data.data || { name: userId },
        }));
      } catch (err) {
        setUserNames((prev) => ({ ...prev, [userId]: { name: userId } }));
      } finally {
        setLoadingUsers(false);
      }
    },
    [userNames]
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const apiUrl =
          process.env.REACT_APP_API_URL || "http://localhost:8000/api";
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiUrl}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Assume res.data.data is the array of orders
        console.log(res.data.data);
        // Fetch user names for all orders
        const userIds = Array.from(
          new Set(res.data.data.map((order) => order.user).filter(Boolean))
        );
        await Promise.all(userIds.map(fetchUserName));
        setOrders(res.data.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    fetchOrders();
  }, [fetchUserName]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedStatus, dateRange, totalRange, sortBy]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleOpenDialog = (order = null) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleExport = () => {
    const csvContent = getFilteredOrders()
      .map((order) => {
        const customerName = userNames[order.user]?.name || order.user || "";
        const total =
          order.orderItems?.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
            0
          ) || 0;
        return `${order._id},${customerName},${new Date(order.createdAt).toLocaleDateString()},${total},${order.status || "pending"}`;
      })
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrintInvoice = (order) => {
    // Implement print invoice functionality
    console.log("Printing invoice for order:", order.orderNumber);
  };

  const handleSendEmail = (order) => {
    // Implement send email functionality
    console.log("Sending email for order:", order.orderNumber);
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdateConfirm = async () => {
    if (!selectedOrder || !newStatus) return;

    setDialogUpdating(true);
    try {
      // Make API call to update backend
      const updateRes = await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000/api"}/orders/${selectedOrder._id}`,
        { status: newStatus }
      );

      // Update local state only after successful API response
      const updatedOrders = orders.map((order) => {
        if (order._id === selectedOrder._id) {
          return {
            ...order,
            status: newStatus,
            statusHistory: [
              ...(order.statusHistory || []),
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                updatedBy: "Admin",
              },
            ],
          };
        }
        return order;
      });

      setOrders(updatedOrders);
      setStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus("");

      // Show success notification
      setToast({
        open: true,
        message: "Order status updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      // Show error notification to user
      setToast({
        open: true,
        message: "Failed to update order status",
        severity: "error",
      });
    } finally {
      setDialogUpdating(false);
    }
  };

  const handleStatusUpdateCancel = () => {
    setStatusDialogOpen(false);
    setSelectedOrder(null);
    setNewStatus("");
  };

  // Function to get filtered and sorted orders
  const getFilteredOrders = useCallback(() => {
    return orders
      .filter((order) => {
        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const orderId = order._id ? order._id.toLowerCase() : "";
        const customerName = userNames[order.user]?.name || "";
        const customerEmail = userNames[order.user]?.email || "";

        const matchesSearch =
          orderId.includes(searchLower) ||
          customerName.toLowerCase().includes(searchLower) ||
          customerEmail.toLowerCase().includes(searchLower);

        // Status filter
        const matchesStatus =
          selectedStatus === "All" || order.status === selectedStatus;

        // Date range filter
        const orderDate = new Date(order.createdAt);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        const matchesDate =
          (!startDate || orderDate >= startDate) &&
          (!endDate || orderDate <= endDate);

        // Total amount filter
        const orderTotal =
          order.orderItems?.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
            0
          ) || 0;
        const minTotal = totalRange.min ? parseFloat(totalRange.min) : null;
        const maxTotal = totalRange.max ? parseFloat(totalRange.max) : null;

        const matchesTotal =
          (!minTotal || orderTotal >= minTotal) &&
          (!maxTotal || orderTotal <= maxTotal);

        return matchesSearch && matchesStatus && matchesDate && matchesTotal;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date_desc":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "date_asc":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "total_desc":
            const totalB =
              b.orderItems?.reduce(
                (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
                0
              ) || 0;
            const totalA =
              a.orderItems?.reduce(
                (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
                0
              ) || 0;
            return totalB - totalA;
          case "total_asc":
            const totalA2 =
              a.orderItems?.reduce(
                (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
                0
              ) || 0;
            const totalB2 =
              b.orderItems?.reduce(
                (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
                0
              ) || 0;
            return totalA2 - totalB2;
          case "status":
            return (a.status || "").localeCompare(b.status || "");
          default:
            return 0;
        }
      });
  }, [
    orders,
    searchTerm,
    selectedStatus,
    dateRange,
    totalRange,
    sortBy,
    userNames,
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Confirmed":
        return "info";
      case "Shipped":
        return "primary";
      case "Pending":
        return "warning";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const statusStyles = {
    pending: { bg: "#ff9800", color: "#fff", icon: <PendingTimeIcon /> }, // orange
    confirmed: {
      bg: "#1976d2",
      color: "#fff",
      icon: <ProcessingInventoryIcon />,
    }, // blue
    shipped: { bg: "#181818", color: "#fff", icon: <ShippedIcon /> }, // black
    delivered: { bg: "#388e3c", color: "#fff", icon: <DeliveredIcon /> }, // green
    cancelled: { bg: "#d32f2f", color: "#fff", icon: <CancelledIcon /> }, // red
    processing: {
      bg: "#757575",
      color: "#fff",
      icon: <ProcessingInventoryIcon />,
    }, // fallback for legacy
  };

  const OrderDetails = ({ order }) => {
    console.log("OrderDetails order:", order);
    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <CustomerIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={String(
                        order.customer && order.customer.name
                          ? order.customer.name
                          : userNames[order.user]?.name || "-"
                      )}
                      secondary={String(
                        order.customer && order.customer.email
                          ? order.customer.email
                          : userNames[order.user]?.email || "-"
                      )}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Phone"
                      secondary={
                        order.customer && order.customer.phone
                          ? order.customer.phone
                          : "-"
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Shipping Address"
                      secondary={order.shippingAddress}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <ReceiptIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Order Number"
                      secondary={order.orderNumber}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Date"
                      secondary={new Date(order.date).toLocaleDateString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  {order.trackingNumber && (
                    <ListItem>
                      <ListItemText
                        primary="Tracking Number"
                        secondary={order.trackingNumber}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                <List>
                  {order.items.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar src={item.image} variant="rounded" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.product}
                        secondary={`Quantity: ${
                          item.quantity
                        } × ${formatPrice(item.price)}`}
                      />
                      <Typography variant="subtitle1">
                        {formatPrice(item.quantity * item.price)}
                      </Typography>
                    </ListItem>
                  ))}
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Total"
                      primaryTypographyProps={{ variant: "h6" }}
                    />
                    <Typography variant="h6" color="primary">
                      {formatPrice(order.total)}
                    </Typography>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          {order.notes && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body1">{order.notes}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const ViewOrderDialog = ({ open, onClose, order }) => {
    if (!order) return null;

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <OrderDetails order={order} />
            </Grid>

            {/* Status History Section */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status History
                  </Typography>
                  <List>
                    {(order.statusHistory || []).map((history, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemIcon>
                            {
                              orderStatuses.find(
                                (s) => s.value === history.status
                              )?.icon
                            }
                          </ListItemIcon>
                          <ListItemText
                            primary={history.status}
                            secondary={
                              <>
                                <Typography variant="body2" component="span">
                                  {new Date(history.timestamp).toLocaleString()}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Updated by: {history.updatedBy}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index < (order.statusHistory || []).length - 1 && (
                          <Divider />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            variant="contained"
            onClick={() => handleStatusUpdate(order)}
            startIcon={<UpdateIcon />}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Status Update Dialog
  const StatusUpdateDialog = ({
    open,
    onClose,
    order,
    newStatus,
    onNewStatusChange,
    onConfirm,
    loading = false,
  }) => {
    if (!order) return null;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onConfirm();
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EditStatusIcon color="primary" />
            <Typography variant="h6">Update Order Status</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Order Information
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Order Number:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {order.orderNumber}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Current Status:
              </Typography>
              <Chip
                label={order.status}
                color={getStatusColor(order.status)}
                size="small"
                icon={orderStatuses.find((s) => s.value === order.status)?.icon}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              New Status
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Status</InputLabel>
              <Select
                value={newStatus}
                label="Select Status"
                onChange={(e) => onNewStatusChange(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {orderStatuses.map((status) => (
                  <MenuItem
                    key={status.value}
                    value={status.value}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      py: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: `${status.color}.main`,
                      }}
                    >
                      {status.icon}
                      <Typography>{status.value}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {newStatus !== order.status && (
            <Alert severity="info" sx={{ mt: 2 }} icon={<EditStatusIcon />}>
              Status will be updated from <strong>{order.status}</strong> to{" "}
              <strong>{newStatus}</strong>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: "background.default" }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            color="primary"
            disabled={!newStatus || newStatus === order.status || loading}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <EditStatusIcon />
              )
            }
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  const statuses = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  // Add debug log in Orders main render (before return)
  console.log("userNames:", userNames);
  console.log("orders:", orders);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Order Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track all customer orders
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ minWidth: 120 }}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button> */}
          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={handleExport}
            sx={{ minWidth: 120 }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search orders by number, customer, or email..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Filter by Status"
                onChange={handleStatusChange}
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "divider",
                  },
                }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort Orders</InputLabel>
              <Select
                value={sortBy}
                label="Sort Orders"
                onChange={handleSortChange}
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "divider",
                  },
                }}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {showFilters && (
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Date Range
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, end: e.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Total Amount Range
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="Minimum Amount"
                    type="number"
                    value={totalRange.min}
                    onChange={(e) =>
                      setTotalRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    InputProps={{
                      startAdornment: <PaymentIcon color="action" />,
                      inputProps: { min: 0 },
                    }}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    label="Maximum Amount"
                    type="number"
                    value={totalRange.max}
                    onChange={(e) =>
                      setTotalRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    InputProps={{
                      startAdornment: <PaymentIcon color="action" />,
                      inputProps: { min: 0 },
                    }}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Results Summary */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {getFilteredOrders().length} of {orders.length} orders
          {(searchTerm ||
            selectedStatus !== "All" ||
            dateRange.start ||
            dateRange.end ||
            totalRange.min ||
            totalRange.max) && <span> (filtered)</span>}
        </Typography>
        {getFilteredOrders().length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Page {page + 1} of{" "}
            {Math.ceil(getFilteredOrders().length / rowsPerPage)}
          </Typography>
        )}
      </Box>

      {/* Orders Table */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Order Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredOrders()
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow
                    key={order._id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {order._id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {order.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                        {order.user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" align="center">
                        {order.orderItems?.reduce(
                          (sum, item) => sum + (item.quantity || 0),
                          0
                        ) || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {formatPrice(
                          order.orderItems?.reduce(
                            (sum, item) =>
                              sum + (item.price || 0) * (item.quantity || 0),
                            0
                          )
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={order.status ? order.status : "pending"}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            setUpdatingStatus((prev) => ({
                              ...prev,
                              [order._id]: true,
                            }));
                            try {
                              const apiUrl =
                                process.env.REACT_APP_API_URL ||
                                "http://localhost:8000/api";
                              const token = localStorage.getItem("token");
                              await axios.put(
                                `${apiUrl}/orders/${order._id}/status`,
                                { status: newStatus },
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              );
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o._id === order._id
                                    ? { ...o, status: newStatus }
                                    : o
                                )
                              );
                              setToast({
                                open: true,
                                message: "Order status updated successfully!",
                                severity: "success",
                              });
                            } catch (err) {
                              setToast({
                                open: true,
                                message: "Failed to update order status",
                                severity: "error",
                              });
                            } finally {
                              setUpdatingStatus((prev) => ({
                                ...prev,
                                [order._id]: false,
                              }));
                            }
                          }}
                          disabled={updatingStatus[order._id]}
                          IconComponent={
                            updatingStatus[order._id]
                              ? () => <CircularProgress size={20} />
                              : undefined
                          }
                          displayEmpty
                          renderValue={(value) => (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {updatingStatus[order._id] && (
                                <CircularProgress size={16} />
                              )}
                              <Typography variant="body2">
                                {value || "pending"}
                              </Typography>
                            </Box>
                          )}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="processing">Processing</MenuItem>
                          <MenuItem value="shipped">Shipped</MenuItem>
                          <MenuItem value="out-for-delivery">
                            Out for Delivery
                          </MenuItem>
                          <MenuItem value="delivered">Delivered</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={getFilteredOrders().length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        />
      </Paper>

      {/* Status Update Dialog */}
      <StatusUpdateDialog
        open={statusDialogOpen}
        onClose={handleStatusUpdateCancel}
        order={selectedOrder}
        newStatus={newStatus}
        onNewStatusChange={setNewStatus}
        onConfirm={handleStatusUpdateConfirm}
        loading={dialogUpdating}
      />

      {/* Order Details Dialog */}
      <ViewOrderDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        order={selectedOrder}
      />
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default Orders;
