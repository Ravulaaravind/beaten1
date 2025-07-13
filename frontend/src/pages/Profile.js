import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  MenuItem,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  Star as StarIcon,
  ShoppingCart as ShoppingCartIcon,
  AddLocationAlt as AddLocationIcon,
  Logout as LogoutIcon,
  DeleteForever as DeleteIcon,
  WorkspacePremium as PremiumIcon,
  CreditCard as CreditCardIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { API_ENDPOINTS, buildApiUrl, handleApiError } from "../utils/api";

const matteColors = {
  900: "#1a1a1a",
  800: "#2d2d2d",
  700: "#404040",
  600: "#525252",
  100: "#f5f5f5",
};

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
});

const Profile = ({ mode }) => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { cart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [editAddressDialog, setEditAddressDialog] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [addressForm, setAddressForm] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
    isDefault: false,
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    gender: "",
    dob: "",
    phone: "",
  });
  const [isAddAddress, setIsAddAddress] = useState(false);
  const [deleteAddressDialog, setDeleteAddressDialog] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(buildApiUrl(API_ENDPOINTS.USER_PROFILE), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileUser(res.data.data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, navigate]);

  useEffect(() => {
    if (profileUser) {
      setProfileForm({
        name: profileUser.name || "",
        gender: profileUser.gender || "",
        dob: profileUser.dob || "",
        phone: profileUser.phone || "",
      });
    }
  }, [profileUser]);

  // Format date of birth for display
  const formatDateOfBirth = (dob) => {
    if (!dob) return "N/A";
    try {
      const date = new Date(dob);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formik = useFormik({
    initialValues: {
      name: profileUser?.name || "",
      phone: profileUser?.phone || "",
      address: profileUser?.address || "",
      city: profileUser?.city || "",
      state: profileUser?.state || "",
      pincode: profileUser?.pincode || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        await updateProfile(values);
        setSuccess("Profile updated successfully");
        setIsEditing(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update profile");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEditProfile = () => {
    setEditProfileDialog(true);
  };
  const handleProfileSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        buildApiUrl(API_ENDPOINTS.UPDATE_PROFILE),
        profileForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditProfileDialog(false);
      // Refresh profile
      const res = await axios.get(buildApiUrl(API_ENDPOINTS.USER_PROFILE), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileUser(res.data.data);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (addr) => {
    setAddressToEdit(addr);
    setAddressForm({
      address: addr.address.split(",")[0] || "",
      city: addr.address.split(",")[1]?.trim() || "",
      state: addr.address.split(",")[2]?.trim() || "",
      country: addr.address.split(",")[3]?.trim() || "",
      postalCode: addr.address.split(",")[4]?.trim() || "",
      phone: addr.phone || "",
      isDefault: addr.isDefault || false,
    });
    setEditAddressDialog(true);
  };
  const handleAddAddress = () => {
    setIsAddAddress(true);
    setAddressToEdit(null);
    setAddressForm({
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      phone: "",
      isDefault: false,
    });
    setEditAddressDialog(true);
  };

  const handleAddressSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (isAddAddress) {
        await axios.post(
          buildApiUrl(API_ENDPOINTS.USER_ADDRESSES),
          addressForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.patch(
          buildApiUrl(API_ENDPOINTS.USER_ADDRESS_DETAIL(addressToEdit._id)),
          addressForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      setEditAddressDialog(false);
      setIsAddAddress(false);
      // Refresh profile
      const res = await axios.get(buildApiUrl(API_ENDPOINTS.USER_PROFILE), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileUser(res.data.data);
    } catch (err) {
      setError("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = (addr) => {
    setAddressToDelete(addr);
    setDeleteAddressDialog(true);
  };
  const confirmDeleteAddress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(
        buildApiUrl(API_ENDPOINTS.USER_ADDRESS_DETAIL(addressToDelete._id)),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDeleteAddressDialog(false);
      setAddressToDelete(null);
      // Refresh profile
      const res = await axios.get(buildApiUrl(API_ENDPOINTS.USER_PROFILE), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileUser(res.data.data);
    } catch (err) {
      setError("Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    logout && logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfileUser(null);
    navigate("/login");
  };

  // Delete account handler (demo only)
  const handleDeleteAccount = () => {
    setDeleteDialog(false);
    // Add real delete logic here
    logout && logout();
    navigate("/");
  };

  if (loading)
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profileUser) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
        py: { xs: 0, md: 4 },
        px: 0,
        margin: 0,
      }}
    >
      <Container
        sx={{
          py: { xs: 4, md: 8 },
          bgcolor: mode === "dark" ? "#181818" : "#fff",
          color: mode === "dark" ? "#fff" : "#181818",
          minHeight: "100vh",
          transition: "background 0.3s, color 0.3s",
        }}
      >
        {/* Profile Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
                mb: 0.5,
                color: mode == "dark" ? "#fff" : "#181818",
              }}
            >
              {profileUser.name}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 400,
                color: mode == "dark" ? "#fff" : "#181818",
              }}
            >
              Welcome back! Manage your account and preferences below.
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Personal Information */}
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 4,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                position: "relative",
                mb: 4,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                sx={{
                  position: "absolute",
                  top: 24,
                  right: 24,
                  borderRadius: 8,
                  textTransform: "none",
                  fontWeight: 500,
                  boxShadow: 2,
                }}
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography sx={{ fontWeight: 500, minWidth: 90 }}>
                      Name:
                    </Typography>
                    <Typography sx={{ ml: 1 }}>{profileUser.name}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CakeIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography sx={{ fontWeight: 500, minWidth: 90 }}>
                      Date of Birth:
                    </Typography>
                    <Typography sx={{ ml: 1 }}>
                      {formatDateOfBirth(profileUser.dob)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PhoneIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography sx={{ fontWeight: 500, minWidth: 90 }}>
                      Phone:
                    </Typography>
                    <Typography sx={{ ml: 1 }}>{profileUser.phone}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <EmailIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography sx={{ fontWeight: 500, minWidth: 90 }}>
                      Email:
                    </Typography>
                    <Typography sx={{ ml: 1 }}>{profileUser.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography sx={{ fontWeight: 500, minWidth: 90 }}>
                      Gender:
                    </Typography>
                    <Typography sx={{ ml: 1 }}>{profileUser.gender}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            {/* Addresses */}
            <Paper
              elevation={2}
              sx={{
                p: { xs: 3, md: 4 },
                mb: 4,
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary", mb: 0 }}
                >
                  Addresses
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddLocationIcon />}
                  sx={{
                    borderRadius: 8,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                  onClick={handleAddAddress}
                >
                  Add Address
                </Button>
              </Box>
              {profileUser.addresses && profileUser.addresses.length > 0 ? (
                profileUser.addresses.map((addr, idx) => (
                  <Paper
                    key={addr._id || idx}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {addr.label || "Home"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {addr.address}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 8, textTransform: "none" }}
                        onClick={() => handleEditAddress(addr)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ borderRadius: 8, textTransform: "none" }}
                        onClick={() => handleDeleteAddress(addr)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary">
                  No addresses found.
                </Typography>
              )}
            </Paper>
          </Grid>
          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Membership */}
            <Paper
              elevation={2}
              sx={{
                p: { xs: 3, md: 4 },
                mb: 4,
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary", mb: 2 }}
              >
                Membership
              </Typography>
              {profileUser?.subscription &&
              profileUser.subscription.isSubscribed &&
              new Date(profileUser.subscription.subscriptionExpiry) >
                new Date() ? (
                <Box>
                  <Typography sx={{ fontWeight: 600, color: "#ff9800", mb: 1 }}>
                    <PremiumIcon
                      sx={{ color: "#FFD700", verticalAlign: "middle", mr: 1 }}
                    />
                    Premium Member
                  </Typography>
                  <Typography>
                    Days left:{" "}
                    <b>
                      {Math.ceil(
                        (new Date(profileUser.subscription.subscriptionExpiry) -
                          new Date()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </b>
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">No membership.</Typography>
              )}
            </Paper>
            {/* Account Actions */}
            <Paper
              elevation={2}
              sx={{
                p: { xs: 3, md: 4 },
                mb: 4,
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary", mb: 2 }}
              >
                Account Actions
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleSignOut}
                sx={{
                  mb: 2,
                  borderRadius: 8,
                  textTransform: "none",
                  fontWeight: 500,
                  width: "100%",
                }}
              >
                Sign Out
              </Button>
            </Paper>
          </Grid>
        </Grid>
        {/* Edit Profile Dialog */}
        <Dialog
          open={editProfileDialog}
          onClose={() => setEditProfileDialog(false)}
        >
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
            />
            <TextField
              label="Gender"
              select
              fullWidth
              margin="normal"
              value={profileForm.gender}
              onChange={(e) =>
                setProfileForm({ ...profileForm, gender: e.target.value })
              }
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              label="Date of Birth"
              type="date"
              fullWidth
              margin="normal"
              value={profileForm.dob}
              onChange={(e) =>
                setProfileForm({ ...profileForm, dob: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Phone"
              fullWidth
              margin="normal"
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm({ ...profileForm, phone: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditProfileDialog(false)}>Cancel</Button>
            <Button onClick={handleProfileSave} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        {/* Edit Address Dialog */}
        <Dialog
          open={editAddressDialog}
          onClose={() => {
            setEditAddressDialog(false);
            setIsAddAddress(false);
          }}
        >
          <DialogTitle>
            {isAddAddress ? "Add Address" : "Edit Address"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Address"
              fullWidth
              margin="normal"
              value={addressForm.address}
              onChange={(e) =>
                setAddressForm({ ...addressForm, address: e.target.value })
              }
            />
            <TextField
              label="City"
              fullWidth
              margin="normal"
              value={addressForm.city}
              onChange={(e) =>
                setAddressForm({ ...addressForm, city: e.target.value })
              }
            />
            <TextField
              label="State"
              fullWidth
              margin="normal"
              value={addressForm.state}
              onChange={(e) =>
                setAddressForm({ ...addressForm, state: e.target.value })
              }
            />
            <TextField
              label="Country"
              fullWidth
              margin="normal"
              value={addressForm.country}
              onChange={(e) =>
                setAddressForm({ ...addressForm, country: e.target.value })
              }
            />
            <TextField
              label="Postal Code"
              fullWidth
              margin="normal"
              value={addressForm.postalCode}
              onChange={(e) =>
                setAddressForm({ ...addressForm, postalCode: e.target.value })
              }
            />
            <TextField
              label="Phone"
              fullWidth
              margin="normal"
              value={addressForm.phone}
              onChange={(e) =>
                setAddressForm({ ...addressForm, phone: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setEditAddressDialog(false);
                setIsAddAddress(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddressSave} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        {/* Delete Address Dialog */}
        <Dialog
          open={deleteAddressDialog}
          onClose={() => setDeleteAddressDialog(false)}
        >
          <DialogTitle>Delete Address</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this address?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteAddressDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteAddress}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile;
