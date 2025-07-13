const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");
const { STATUS_CODES, MESSAGES } = require("../utils/constants");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Register admin
// @route   POST /api/admin/register
// @access  Public (should be restricted in production)
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(STATUS_CODES.CONFLICT).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
    });

    if (admin) {
      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: "Admin registered successfully",
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          token: generateToken(admin._id, "admin"),
        },
      });
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Invalid admin data",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for admin email
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: "Admin account is deactivated",
      });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    await admin.updateLastLogin();

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Admin logged in successfully",
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
        token: generateToken(admin._id, "admin"),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin only)
const getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Admin profile retrieved successfully",
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        emailVerified: admin.emailVerified,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin only)
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Check if email is being updated and if it already exists
    if (email && email !== req.admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(STATUS_CODES.CONFLICT).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    const admin = await Admin.findByIdAndUpdate(
      req.admin._id,
      {
        name: name || req.admin.name,
        email: email || req.admin.email,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Admin profile updated successfully",
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        emailVerified: admin.emailVerified,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private (Admin only)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id).select("+password");

    if (!admin) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check current password
    const isMatch = await admin.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout admin
// @route   POST /api/admin/logout
// @access  Private (Admin only)
const logout = async (req, res, next) => {
  try {
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics (admin)
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const dashboardAnalytics = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();
    // Total orders
    const totalOrders = await Order.countDocuments();
    // Total products
    const totalProducts = await Product.countDocuments();
    // Total revenue (only delivered orders)
    const orders = await Order.find();
    const totalRevenue = orders
      .filter((o) => (o.status || "").toLowerCase() === "delivered")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    // Category distribution
    const categoryStats = await Product.aggregate([
      { $unwind: "$categories" },
      { $group: { _id: "$categories", count: { $sum: 1 } } },
    ]);
    // Recent activities (last 10 orders)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name");
    const recentActivities = recentOrders.map((order) => ({
      id: order._id,
      type: "order",
      message: `Order #${order._id.toString().slice(-6)} placed by ${order.user?.name || "Unknown"}`,
      time: order.createdAt,
      amount: order.totalPrice,
    }));
    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        categoryStats,
        recentActivities,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching dashboard analytics",
        error: error.message,
      });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  dashboardAnalytics,
};
