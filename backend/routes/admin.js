const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  dashboardAnalytics,
} = require("../controllers/adminController");
const User = require("../models/User");
const { protectAdmin } = require("../middleware/auth");
const {
  adminRegisterValidation,
  adminLoginValidation,
  adminProfileUpdateValidation,
  adminPasswordChangeValidation,
} = require("../middleware/validation");
const { sendReturnStatusEmail } = require("../utils/emailService");

// Public routes
router.post("/register", adminRegisterValidation, register);
router.post("/login", adminLoginValidation, login);

// Protected routes (Admin only)
router.get("/profile", protectAdmin, getProfile);
router.put(
  "/profile",
  protectAdmin,
  adminProfileUpdateValidation,
  updateProfile
);
router.put(
  "/change-password",
  protectAdmin,
  adminPasswordChangeValidation,
  changePassword
);
router.post("/logout", protectAdmin, logout);

// Dashboard analytics endpoint
router.get("/dashboard", dashboardAnalytics);

// List all returns
router.get("/returns", protectAdmin, async (req, res) => {
  try {

    // Aggregate all returns from all users
    const users = await User.find({}, 'email phone returns');

    const allReturns = [];
    users.forEach((user) => {
      (user.returns || []).forEach((ret) => {
        allReturns.push({
          _id: ret._id,
          userId: user._id,

          user: { email: user.email, phone: user.phone },
          ...ret.toObject()

        });
      });
    });
    res.json({ success: true, data: allReturns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update return status
router.patch("/returns/:id/status", protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    // Find the user and return by return _id
    const user = await User.findOne({ "returns._id": req.params.id });
    if (!user) return res.status(404).json({ message: "Return not found" });
    const ret = user.returns.id(req.params.id);
    if (!ret) return res.status(404).json({ message: "Return not found" });
    ret.status = status;
    await user.save();
    // Send return status update email
    sendReturnStatusEmail(
      user.email,
      user.name,
      ret.orderId,
      ret.productId,
      status
    ).catch(console.error);
    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark return as received
router.patch('/returns/:id/received', protectAdmin, async (req, res) => {
  try {
    // Find the user and return by return _id
    const user = await User.findOne({ 'returns._id': req.params.id });
    if (!user) return res.status(404).json({ message: 'Return not found' });
    const ret = user.returns.id(req.params.id);
    if (!ret) return res.status(404).json({ message: 'Return not found' });
    ret.received = true;
    await user.save();
    res.json({ success: true, message: 'Return marked as received' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
