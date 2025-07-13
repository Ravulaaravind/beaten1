const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const Address = require("../models/Address");
const { sendReturnPlacedEmail } = require("../utils/emailService");
const { manualSubscribe } = require("../controllers/userController");

// GET /api/user/profile
router.get("/profile", protect, async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id || req.user.id)
      .select("-password")
      .populate("addressBook");
    if (!user) return res.status(404).json({ message: "User not found" });
    // Map addressBook to addresses array for frontend
    const addresses = (user.addressBook || []).map((addr) => ({
      _id: addr._id,
      label: addr.label || "Home",
      address: `${addr.address}, ${addr.city}, ${addr.state}, ${addr.country}, ${addr.postalCode}`,
      phone: addr.phone,
      isDefault: addr.isDefault,
    }));
    // Include subscription info in the response
    res.json({
      data: {
        _id: user._id,
        name: user.name,
        gender: user.gender || "",
        dob: user.dob || "",
        phone: user.phone || "",
        email: user.email,
        addresses,
        subscription: user.subscription || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/user/profile (edit user info)
router.patch("/profile", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, gender, dob, phone } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name) user.name = name;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    if (phone) user.phone = phone;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/user/return - submit a return request
router.post("/return", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId, productId, reason } = req.body;
    if (!orderId || !productId || !reason) {
      return res
        .status(400)
        .json({ message: "orderId, productId, and reason are required" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Prevent multiple returns for the same product in the same order
    const alreadyReturned = user.returns.some(
      (r) =>
        r.orderId.toString() === orderId && r.productId.toString() === productId
    );
    if (alreadyReturned) {
      return res.status(400).json({
        success: false,
        message: "You have already requested a return for this product.",
      });
    }
    user.returns.push({ orderId, productId, reason });
    await user.save();
    // Send return placed email
    sendReturnPlacedEmail(
      user.email,
      user.name,
      orderId,
      productId,
      reason
    ).catch(console.error);
    res.json({ success: true, message: "Return request submitted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/user/returns - get user's return requests
router.get("/returns", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Return the user's returns array
    res.json({
      success: true,
      data: user.returns || [],
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/user/manual-subscribe - Manual subscription endpoint
router.post("/manual-subscribe", protect, manualSubscribe);

module.exports = router;
