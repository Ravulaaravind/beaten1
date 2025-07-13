// API Configuration
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Health Check
  HEALTH: "/health",

  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/profile",
  UPDATE_PROFILE: "/auth/profile",
  SEND_OTP_LOGIN: "/auth/send-otp-login",
  VERIFY_OTP_LOGIN: "/auth/verify-otp-login",

  // Forgot Password
  FORGOT_PASSWORD_SEND_OTP: "/forgot-password/user/send-otp",
  FORGOT_PASSWORD_VERIFY_OTP: "/forgot-password/user/verify-otp",
  FORGOT_PASSWORD_RESET: "/forgot-password/user/reset-password",

  // Products
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id) => `/products/${id}`,
  PRODUCT_SEARCH: (query) =>
    `/products/search?search=${encodeURIComponent(query)}`,
  PRODUCTS_BY_CATEGORY: (category) => `/products/category/${category}`,
  FEATURED_PRODUCTS: "/products/featured",
  PRODUCT_CATEGORIES: "/products/categories",
  PRODUCT_STATS: "/products/stats",
  BULK_UPDATE_PRODUCTS: "/products/bulk-update",

  // User
  USER_PROFILE: "/user/profile",
  USER_RETURNS: "/user/returns",
  USER_RETURN_SUBMIT: "/user/return",
  USER_MANUAL_SUBSCRIBE: "/user/manual-subscribe",

  // Addresses
  USER_ADDRESSES: "/user/addresses",
  USER_ADDRESS_DETAIL: (id) => `/user/addresses/${id}`,

  // Orders
  ORDERS: "/orders",
  ORDERS_MY_ORDERS: "/orders/my-orders",
  ORDER_DETAIL: (id) => `/orders/${id}`,
  ORDER_MY_DETAIL: (id) => `/orders/my/${id}`,
  ORDER_STATUS_UPDATE: (id) => `/orders/${id}/status`,

  // Coupons
  COUPONS: "/coupons",
  COUPONS_APPLY: "/coupons/apply",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_COUPON_DETAIL: (id) => `/admin/coupons/${id}`,

  // Email
  EMAIL_SEND: "/email/send-email",

  // Upload
  UPLOAD: "/upload",

  // Admin (if needed for frontend)
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_USERS: "/admin/users",
  ADMIN_DASHBOARD: "/admin/dashboard",
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to get full API URL with auth headers
export const getApiConfig = (endpoint, method = "GET", data = null) => {
  const config = {
    url: buildApiUrl(endpoint),
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.data = data;
  }

  return config;
};

// Common API response handler
export const handleApiResponse = (response) => {
  if (response.data && response.data.success !== undefined) {
    return response.data;
  }
  return response.data;
};

// Common API error handler
export const handleApiError = (error) => {
  const message =
    error.response?.data?.message || error.message || "An error occurred";
  const status = error.response?.status;

  return {
    message,
    status,
    error: error.response?.data || error,
  };
};
