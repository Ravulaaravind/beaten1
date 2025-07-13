import axios from "axios";

// Create axios instance for admin API
const adminAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
adminAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const token = localStorage.getItem("admin_token");
    if (error.response?.status === 401 && token) {
      // Token expired or invalid, only redirect if already logged in
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Admin Authentication API
export const authAPI = {
  // Register new admin
  register: async (adminData) => {
    try {
      const response = await adminAPI.post("/admin/register", adminData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },

  // Login admin
  login: async (credentials) => {
    try {
      const response = await adminAPI.post("/admin/login", credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  // Get admin profile
  getProfile: async () => {
    try {
      const response = await adminAPI.get("/admin/profile");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to get profile");
    }
  },

  // Update admin profile
  updateProfile: async (profileData) => {
    try {
      const response = await adminAPI.put("/admin/profile", profileData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  },

  // Change admin password
  changePassword: async (passwordData) => {
    try {
      const response = await adminAPI.put(
        "/admin/change-password",
        passwordData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to change password"
      );
    }
  },

  // Logout admin
  logout: async () => {
    try {
      const response = await adminAPI.post("/admin/logout");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Logout failed");
    }
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await adminAPI.get("/health");
    return response.data;
  } catch (error) {
    throw new Error("API server is not responding");
  }
};

export default adminAPI;
