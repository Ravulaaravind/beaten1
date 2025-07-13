import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
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
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const adminAuthAPI = {
  // Register (User or Admin)
  register: (data) => api.post("/auth/register", data),
  // Login (User or Admin)
  login: (data) => api.post("/auth/login", data),
};

// Dashboard APIs
export const dashboardAPI = {
  // Get all dashboard analytics in one call
  getDashboardAnalytics: () => api.get("/admin/dashboard"),
};

// Products APIs
export const productsAPI = {
  // Get all products
  getProducts: (params) => api.get("/products", { params }),
  // Get single product
  getProductById: (id) => api.get(`/products/${id}`),
  // Create product
  createProduct: (data) => api.post("/products", data),
  // Update product
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  // Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),
  // Bulk delete products (we'll implement this as individual deletes)
  bulkDeleteProducts: async (ids) => {
    const promises = ids.map((id) => api.delete(`/products/${id}`));
    return Promise.all(promises);
  },
  // Get product stats
  getProductStats: () => api.get("/products/stats"),
};

// Orders APIs
export const ordersAPI = {
  getOrders: (params) => api.get("/orders", { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

// Customers APIs
export const customersAPI = {
  getCustomers: (params) => api.get("/users", { params }),
  getCustomerById: (id) => api.get(`/users/${id}`),
  updateCustomer: (id, data) => api.put(`/users/${id}`, data),
  deleteCustomer: (id) => api.delete(`/users/${id}`),
};

export default api;
