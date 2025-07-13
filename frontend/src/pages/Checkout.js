import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider,
  Alert,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import axios from "axios";

const steps = ["Shipping Address"];

const Checkout = ({ mode = "dark" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });
  const [addressDialog, setAddressDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Calculate totals
  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const discount = (user?.isPremium && new Date(user.premiumExpiry) > new Date()) ? 250 : 0;
  const shipping = subtotal > 0 ? 100 : 0;
  const total = subtotal - discount + shipping;
  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    fetchAddresses();
    fetchPublicCoupons();
  }, []);

  // Replace fetchAddresses with real API call
  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userAddresses = response.data.data || [];
      setAddresses(userAddresses);
      const defaultAddress = userAddresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(String(defaultAddress._id));
      } else if (userAddresses.length === 1) {
        setSelectedAddress(String(userAddresses[0]._id));
      }
    } catch (err) {
      setError("Failed to load addresses");
    }
  };

  const fetchPublicCoupons = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/coupons`);
      const coupons = response.data.data || [];
      setPublicCoupons(coupons.filter(c => c.type === 'public'));
    } catch (err) {
      // Optionally handle error
    }
  };

  // Replace handleAddressSubmit with real API call
  const handleAddressSubmit = async () => {
    try {
      //console.log("camed to ass");

      if (!user) {
        setError("Please login to save addresses");
        return;
      }
      if (
        !newAddress.phone ||
        !newAddress.street ||
        !newAddress.city ||
        !newAddress.state ||
        !newAddress.pincode
      ) {
        setError("Please fill in all required fields");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(newAddress.phone)) {
        setError(
          "Please enter a valid 10-digit phone number starting with 6-9"
        );
        return;
      }
      if (!/^[1-9][0-9]{5}$/.test(newAddress.pincode)) {
        setError("Please enter a valid 6-digit pincode");
        return;
      }
      const token = localStorage.getItem("token");
      const addressData = {
        name: newAddress.name.trim(),
        address: newAddress.street.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        country: "India",
        postalCode: newAddress.pincode.trim(),
        phone: newAddress.phone.trim(),
        isDefault: newAddress.isDefault,
      };
      console.log("came to address submit");

      if (newAddress._id) {
        // Edit address
        await axios.patch(
          `${BASE_URL}/user/addresses/${newAddress._id}`,
          addressData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Add new address
        await axios.post(`${BASE_URL}/user/addresses`, addressData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setAddressDialog(false);
      setError(null);
      fetchAddresses(); // Refresh addresses
      setNewAddress({
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleNext = () => {
    if (!selectedAddress) {
      setError("Please select a shipping address");
      return;
    }
    // Navigate to payment page with selected address
    navigate("/payment", { state: { selectedAddress } });
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");
    try {
      // Calculate total with COD charge if applicable
      const finalTotal = paymentMethod === "cod" ? total + 50 : total;

      // Find the selected address object
      const selectedAddressObj = addresses.find(
        (addr) => String(addr._id) === String(selectedAddress)
      );
      if (!selectedAddressObj) {
        setError("Please select a valid shipping address");
        setLoading(false);
        return;
      }

      // Prepare order payload
      const orderPayload = {
        orderItems: cart.map((item) => ({
          product: item.product._id, // Ensure this is a real ObjectId from your DB
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.product.price,
        })),
        shippingAddress: selectedAddressObj._id, // Send only the address ID
        paymentMethod,
        total: finalTotal,
        codCharge: paymentMethod === "cod" ? 50 : 0,
      };

      const token = localStorage.getItem("token");
      // Send order to backend
      await axios.post(`${BASE_URL}/orders`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrderPlaced(true);
      clearCart();
      setLoading(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Payment failed. Please try again."
      );
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
          bgcolor: mode === "dark" ? "#181818" : "#fff",
          color: mode === "dark" ? "#fff" : "#181818",
          minHeight: "100vh",
          transition: "background 0.3s, color 0.3s",
        }}
      >
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" paragraph>
            Thank you for shopping with BEATEN. We'll send you an email with the
            order details.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/orders")}
          >
            View Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  // Check if cart is empty
  if (cart.length === 0) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
          bgcolor: mode === "dark" ? "#181818" : "#fff",
          color: mode === "dark" ? "#fff" : "#181818",
          minHeight: "100vh",
          transition: "background 0.3s, color 0.3s",
        }}
      >
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Your Cart is Empty
          </Typography>
          <Typography variant="body1" paragraph>
            Please add some items to your cart before proceeding to checkout.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "#181818",
        minHeight: "100vh",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={{
                color: mode === "dark" ? "#fff" : "#181818",
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {activeStep === 0 && (
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6">Shipping Address</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setAddressDialog(true)}
                >
                  Add New Address
                </Button>
              </Box>

              <RadioGroup
                value={selectedAddress || ""}
                onChange={(e) => setSelectedAddress(String(e.target.value))}
              >
                {addresses.map((address) => (
                  <Paper
                    key={address._id}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: "1px solid",
                      borderColor:
                        selectedAddress === address._id
                          ? "primary.main"
                          : "divider",
                      position: "relative",
                    }}
                  >
                    <FormControlLabel
                      value={address._id}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle1">
                            {address.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {address.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {address.city}, {address.state} - {address.postalCode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Phone: {address.phone}
                          </Typography>
                          {address.label && (
                            <Typography variant="caption" color="primary">
                              {address.label}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => {
                          setNewAddress({
                            name: address.name || "",
                            phone: address.phone || "",
                            street: address.address || "",
                            city: address.city || "",
                            state: address.state || "",
                            pincode: address.postalCode || "",
                            isDefault: address.isDefault || false,
                            _id: address._id,
                          });
                          setAddressDialog(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this address?"
                            )
                          ) {
                            try {
                              const token = localStorage.getItem("token");
                              await axios.delete(
                                `${BASE_URL}/user/addresses/${address._id}`,
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              );
                              fetchAddresses();
                            } catch (err) {
                              setError("Failed to delete address");
                            }
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </RadioGroup>
            </Paper>
          )}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ my: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography>Subtotal</Typography>
                <Typography>{formatPrice(subtotal)}</Typography>
              </Box>
              {user?.isPremium && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Premium Discount</Typography>
                  <Typography color="success.main">
                    -{formatPrice(discount)}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography>Shipping</Typography>
                <Typography>{formatPrice(shipping)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  {formatPrice(total)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Address Dialog */}
      <Dialog
        open={addressDialog}
        onClose={() => setAddressDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            mt: 14, // Increased gap below navbar
            position: "relative",
          },
        }}
      >
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent
          sx={{
            maxHeight: "60vh", // Make dialog content scrollable if too tall
            overflowY: "auto",
          }}
        >
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newAddress.name}
              onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={newAddress.phone}
              onChange={(e) =>
                setNewAddress({ ...newAddress, phone: e.target.value })
              }
              sx={{ mb: 2 }}
              helperText="Enter 10-digit number starting with 6-9"
            />
            <TextField
              fullWidth
              label="Street Address"
              value={newAddress.street}
              onChange={(e) =>
                setNewAddress({ ...newAddress, street: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="PIN Code"
              value={newAddress.pincode}
              onChange={(e) =>
                setNewAddress({ ...newAddress, pincode: e.target.value })
              }
              sx={{ mt: 2, mb: 2 }}
              helperText="Enter 6-digit pincode"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newAddress.isDefault}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      isDefault: e.target.checked,
                    })
                  }
                />
              }
              label="Set as default address"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressDialog(false)}>Cancel</Button>
          <Button onClick={handleAddressSubmit} color="primary">
            Save Addresses
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Checkout;
