const Order = require("../models/Order");
const { STATUS_CODES } = require("../utils/constants");
const {
  sendOrderStatusEmail,
  sendOrderConfirmedEmail,
} = require("../utils/emailService");

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    console.log("camed to here");
    console.log("req.body", req.body);
    const { orderItems, shippingAddress, paymentInfo, totalPrice } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No order items",
      });
    }
    if (!shippingAddress) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Shipping address required",
      });
    }
    // Fetch user to check subscription
    const user = await require("../models/User").findById(req.user._id);
    let finalPrice = totalPrice;
    if (
      user &&
      user.subscription &&
      user.subscription.isSubscribed &&
      user.subscription.subscriptionExpiry > new Date()
    ) {
      // Reduce price by subscription cost, but not below zero
      finalPrice = Math.max(0, totalPrice - (user.subscription.subscriptionCost || 0));
    }
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentInfo,
      totalPrice: finalPrice,
    });
    const createdOrder = await order.save();
    // Send order confirmation email
    const populatedOrder = await order.populate("user", "name email");
    if (populatedOrder.user && populatedOrder.user.email) {
      await sendOrderConfirmedEmail(
        populatedOrder.user.email,
        order._id,
        populatedOrder.user.name
      );
    }
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: "Order placed successfully",
      data: createdOrder,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to place order",
    });
  }
};

// @desc    Get all orders for the logged-in user
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('shippingAddress'); // Populate address details

    // Debug: Log the populated shippingAddress for each order
    orders.forEach(order => {
      console.log('Order ID:', order._id);
      console.log('Populated Shipping Address:', order.shippingAddress);
    });

    // Add originalPrice and subscriptionDiscount to each order
    const ordersWithDiscountInfo = orders.map(order => {
      let originalPrice = order.totalPrice;
      let subscriptionDiscount = 0;
      if (order.paymentInfo && order.paymentInfo.originalPrice) {
        // If already stored, use it
        originalPrice = order.paymentInfo.originalPrice;
        subscriptionDiscount = originalPrice - order.totalPrice;
      } else if (order._doc && order._doc.originalPrice) {
        // If stored in doc
        originalPrice = order._doc.originalPrice;
        subscriptionDiscount = originalPrice - order.totalPrice;
      }
      return {
        ...order._doc,
        originalPrice,
        subscriptionDiscount,
        debugShippingAddress: order.shippingAddress, // Add for debugging
      };
    });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: ordersWithDiscountInfo,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("shippingAddress")
      .sort({ createdAt: -1 });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch all orders",
    });
  }
};

// @desc    Get order by ID (admin only)
// @route   GET /api/orders/:id
// @access  Admin
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("shippingAddress");
    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

// @desc    Update order status (admin only)
// @route   PATCH /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    console.log("camed to");

    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    await order.save();
    // Send email notification to user
    if (order.user && order.user.email) {
      await sendOrderStatusEmail(
        order.user.email,
        status,
        order._id,
        order.user.name
      );
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

// @desc    Get a single order for the logged-in user
// @route   GET /api/orders/my/:id
// @access  Private
const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate("shippingAddress");
    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrderById,
};
