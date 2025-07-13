import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Divider,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  CircularProgress,
  IconButton,
  Chip,
  Alert,
} from "@mui/material";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaymentsIcon from "@mui/icons-material/Payments";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import axios from "axios";
import { API_ENDPOINTS, buildApiUrl, handleApiError } from "../utils/api";
// Remove: import { mockCoupons, validateCoupon } from "../data/mockData";

// Dynamically load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Payment = ({ mode = "dark" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const location = useLocation();
  const selectedAddress = location.state?.selectedAddress;
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showOffers, setShowOffers] = useState(false);

  useEffect(() => {
    // Fetch public coupons from backend
    const fetchCoupons = async () => {
      try {
        const response = await axios.get(buildApiUrl(API_ENDPOINTS.COUPONS));
        console.log("response", response.data.data);
        const coupons = response.data.data || [];
        const filtered = coupons.filter((c) => c.type === "public");
        console.log("filteredCoupons", filtered);
        setAvailableCoupons(filtered);
      } catch (err) {
        const error = handleApiError(err);
        console.error("Error fetching coupons:", error);
        setAvailableCoupons([]);
      }
    };
    fetchCoupons();
  }, []);

  // Calculate totals
  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const discount =
    user?.isPremium && new Date(user.premiumExpiry) > new Date() ? 250 : 0;
  const shipping = subtotal > 0 ? 100 : 0;
  const total = subtotal - discount - couponDiscount + shipping;

  const handleApplyCoupon = async () => {
    if (couponApplied) return;

    if (!coupon.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.COUPONS_APPLY),
        {
          code: coupon.trim(),
          userId: user?._id,
          cartTotal: subtotal,
        }
      );

      if (response.data.success) {
        // Calculate discount (assuming percent)
        const discountAmount = Math.round(
          (subtotal * response.data.data.discount) / 100
        );
        setCouponDiscount(discountAmount);
        setCouponApplied(true);
        setAppliedCoupon({
          code: coupon.trim(),
          discountAmount,
        });
        setCouponError("");
      } else {
        setCouponError(response.data.message || "Invalid coupon code");
        setCouponDiscount(0);
        setCouponApplied(false);
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError(err?.response?.data?.message || "Invalid coupon code");
      setCouponDiscount(0);
      setCouponApplied(false);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon("");
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponError("");
    setAppliedCoupon(null);
  };

  const handleViewOffers = async () => {
    setShowOffers((prev) => !prev);
    if (!showOffers) {
      // Fetch fresh coupons when opening offers
      try {
        const response = await axios.get(buildApiUrl(API_ENDPOINTS.COUPONS));
        console.log("response", response.data.data);
        const coupons = response.data.data || [];
        const filtered = coupons.filter((c) => c.type === "public");
        console.log("filteredCoupons", filtered);
        setAvailableCoupons(filtered);
      } catch (err) {
        const error = handleApiError(err);
        console.error("Error fetching coupons:", error);
        setAvailableCoupons([]);
      }
    }
  };

  // Razorpay handler (new approach)
  // const handleRazorpay = async () => {
  //   const script = document.createElement("script");
  //   script.src = "https://checkout.razorpay.com/v1/checkout.js";
  //   script.async = true;
  //   document.body.appendChild(script);
  //   script.onload = async () => {
  //     const options = {
  //       key:
  //         process.env.REACT_APP_RAZORPAY_KEY_TEST || "rzp_test_ftcTPKoHNzJjbG", // Razorpay test key
  //       amount: Math.round(total * 100),
  //       currency: "INR",
  //       name: "BEATEN",
  //       description: `Order Payment (Card, UPI, PhonePe, etc.)`,
  //       handler: async function (response) {
  //         // Place order after successful payment
  //         const success = await createOrder("razorpay");
  //         if (success) {
  //           setOrderPlaced(true);
  //           setLoading(false);
  //           clearCart();
  //         }
  //       },
  //       prefill: {
  //         name: user?.name || "User",
  //         email: user?.email || "user@example.com",
  //         contact: user?.phone || "9876543210",
  //       },
  //       theme: { color: "#111" },
  //     };
  //     // @ts-ignore
  //     const rzp = new window.Razorpay(options);
  //     rzp.open();
  //   };
  // };

  const handleRazorpay = async () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = async () => {
      const options = {
        key: process.env.REACT_APP_RAZOR_KEY || "rzp_test_ftcTPKoHNzJjbG", // Razorpay test key
        amount: Math.round(total * 100),
        currency: "INR",
        name: "PK Trends",
        description: `Order for ${cart.map((item) => item.product.name).join(", ")}`,
        handler: async function (response) {
          // Create order after successful payment
          const success = await createOrder("razorpay");
          if (success) {
            setOrderPlaced(true);
            setLoading(false);
            clearCart();
          }
        },
        prefill: {
          name: user?.name || "User",
          email: user?.email || "user@example.com",
          contact: user?.phone || "9876543210",
        },
        theme: { color: "#111" },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    };
  };

  // Helper to place order in backend
  const createOrder = async (paymentType) => {
    try {
      const finalTotal = paymentMethod === "cod" ? total + 50 : total;
      const orderData = {
        orderItems: cart.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.product.price,
          image: item.product.image,
        })),
        shippingAddress: selectedAddress,
        paymentInfo: {
          method: paymentType,
          status: paymentType === "cod" ? "Pending" : "Paid",
        },
        totalPrice: finalTotal,
      };
      const token = localStorage.getItem("token");
      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.ORDERS),
        orderData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        return true;
      } else {
        setError(response.data.message || "Failed to place order");
        return false;
      }
    } catch (err) {
      const error = handleApiError(err);
      setError(error.message || "Payment failed. Please try again.");
      return false;
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");
    try {
      if (paymentMethod === "razorpay") {
        await handleRazorpay();
        setLoading(false);
        return;
      }
      // COD logic
      const success = await createOrder("cod");
      if (success) {
        setOrderPlaced(true);
        clearCart();
      }
      setLoading(false);
    } catch (err) {
      const error = handleApiError(err);
      setError(error.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" paragraph>
            Thank you for shopping with us.
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

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "#181818",
        minHeight: "100vh",
      }}
    >
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose your preferred payment method
            </Typography>

            {/* Coupon Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Apply Coupon
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TextField
                  label="Coupon Code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  size="small"
                  disabled={couponApplied || validatingCoupon}
                  sx={{ mr: 2, flex: 1 }}
                  placeholder="Enter coupon code"
                />
                <Button
                  variant="outlined"
                  onClick={handleApplyCoupon}
                  disabled={couponApplied || validatingCoupon}
                  sx={{ mr: couponApplied ? 2 : 0 }}
                >
                  {validatingCoupon ? (
                    <CircularProgress size={20} />
                  ) : couponApplied ? (
                    "Applied"
                  ) : (
                    "Apply"
                  )}
                </Button>
                {couponApplied && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </Button>
                )}
              </Box>

              {couponError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {couponError}
                </Alert>
              )}

              {couponApplied && appliedCoupon && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Coupon applied successfully!
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Chip
                        label={appliedCoupon.isPersonal ? "Personal" : "Public"}
                        color={
                          appliedCoupon.isPersonal ? "primary" : "secondary"
                        }
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {appliedCoupon.discount}% off - ₹
                        {appliedCoupon.discountAmount.toFixed(2)} saved
                      </Typography>
                    </Box>
                    {appliedCoupon.isPersonal &&
                      appliedCoupon.recipientName && (
                        <Typography variant="caption" color="text.secondary">
                          For: {appliedCoupon.recipientName}
                        </Typography>
                      )}
                  </Box>
                </Alert>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <IconButton
                color="primary"
                sx={{ mr: 1 }}
                onClick={handleViewOffers}
              >
                <RemoveRedEyeIcon />
              </IconButton>
              <Button
                variant="text"
                color="primary"
                sx={{ textTransform: "none", fontWeight: 600 }}
                onClick={handleViewOffers}
              >
                View Available Offers
              </Button>
            </Box>
            {showOffers && availableCoupons.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Public Coupons
                </Typography>
                {availableCoupons.map((coupon) => (
                  <Paper
                    key={coupon.code}
                    sx={{ p: 2, mb: 1, bgcolor: "#f5f5f5" }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {coupon.code} - {coupon.discount}% off
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Min Purchase: ₹{coupon.minPurchase}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    borderColor:
                      paymentMethod === "razorpay" ? "primary.main" : "divider",
                    backgroundColor:
                      paymentMethod === "razorpay"
                        ? "primary.50"
                        : "background.paper",
                    boxShadow: paymentMethod === "razorpay" ? 2 : 0,
                  }}
                >
                  <FormControlLabel
                    value="razorpay"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          <CreditCardIcon
                            sx={{ mr: 1, verticalAlign: "middle" }}
                          />{" "}
                          Online Payment (Credit/Debit Card)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pay securely with Razorpay
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <PaymentsIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Instant payment confirmation
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PaymentsIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Secure SSL encryption
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CreditCardIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Multiple card options accepted
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    borderColor:
                      paymentMethod === "cod" ? "primary.main" : "divider",
                    backgroundColor:
                      paymentMethod === "cod"
                        ? "primary.50"
                        : "background.paper",
                    boxShadow: paymentMethod === "cod" ? 2 : 0,
                  }}
                >
                  <FormControlLabel
                    value="cod"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          <PaymentsIcon
                            sx={{ mr: 1, verticalAlign: "middle" }}
                          />{" "}
                          Cash on Delivery (COD)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pay when you receive your order
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          • No upfront payment required
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          • Pay with cash or card on delivery
                        </Typography>
                        <Typography
                          variant="caption"
                          color="warning.main"
                          display="block"
                        >
                          • Additional ₹50 COD charge applies
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: 700,
                fontSize: "1.1rem",
                borderRadius: 2,
                background: "#111",
                letterSpacing: 0.5,
              }}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                `Place Order - ${formatPrice(
                  paymentMethod === "cod" ? total + 50 : total
                )}`
              )}
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {cart.map((item) => (
              <Box
                key={item.product._id}
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>
                  {item.product.name} x{item.quantity}
                </Typography>
                <Typography>
                  {formatPrice(item.product.price * item.quantity)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Subtotal</Typography>
              <Typography>{formatPrice(subtotal)}</Typography>
            </Box>
            {user?.isPremium && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>Premium Discount</Typography>
                <Typography color="success.main">
                  -{formatPrice(discount)}
                </Typography>
              </Box>
            )}
            {couponDiscount > 0 && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>Coupon Discount</Typography>
                <Typography color="success.main">
                  -{formatPrice(couponDiscount)}
                </Typography>
              </Box>
            )}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Shipping</Typography>
              <Typography>{formatPrice(shipping)}</Typography>
            </Box>
            {paymentMethod === "cod" && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>COD Charge</Typography>
                <Typography color="warning.main">+₹50</Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={700}>
                {formatPrice(paymentMethod === "cod" ? total + 50 : total)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Payment;
