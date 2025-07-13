// Dummy Data Service - Replaces all backend API calls
// This file contains all the mock data and functions that simulate API responses

// Helper function to simulate API delay
const simulateApiDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to simulate API error (10% chance)
const simulateError = () => Math.random() < 0.1;

// Generate random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Generate random date within last 30 days
const generateRandomDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date.toISOString().split("T")[0];
};

// Generate random price between min and max
const generateRandomPrice = (min = 10, max = 500) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Generate random stock quantity
const generateRandomStock = () => Math.floor(Math.random() * 200) + 1;

// Dashboard Statistics
const dashboardStats = {
  totalRevenue: 125000,
  totalOrders: 1247,
  totalCustomers: 892,
  totalProducts: 156,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  productsGrowth: 5.7,
};

// Sales Trend Data (last 30 days)
const salesTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split("T")[0],
    sales: Math.floor(Math.random() * 5000) + 1000,
    orders: Math.floor(Math.random() * 50) + 10,
    customers: Math.floor(Math.random() * 20) + 5,
  };
});

// Category Distribution
const categoryDistribution = [
  { name: "T-shirts", value: 35, color: "#0088FE" },
  { name: "Shirts", value: 25, color: "#00C49F" },
  { name: "Bottom Wear", value: 20, color: "#FFBB28" },
  { name: "Sneakers", value: 15, color: "#FF8042" },
  { name: "Boots", value: 5, color: "#8884D8" },
];

// Recent Activities
const recentActivities = [
  {
    id: "1",
    type: "order",
    message: "New order #ORD-2024-001 received",
    time: "2 minutes ago",
    amount: 299.99,
  },
  {
    id: "2",
    type: "customer",
    message: "New customer registered: john@example.com",
    time: "15 minutes ago",
    amount: null,
  },
  {
    id: "3",
    type: "product",
    message: 'Product "Classic White T-Shirt" stock updated',
    time: "1 hour ago",
    amount: null,
  },
  {
    id: "4",
    type: "order",
    message: "Order #ORD-2024-002 shipped",
    time: "2 hours ago",
    amount: 149.99,
  },
  {
    id: "5",
    type: "customer",
    message: 'Customer review received for "Premium Hoodie"',
    time: "3 hours ago",
    amount: null,
  },
];

// Top Products
const topProducts = [
  {
    id: "1",
    name: "Classic White T-Shirt",
    sales: 85,
    target: 100,
    revenue: 2550.0,
  },
  {
    id: "2",
    name: "Premium Hoodie",
    sales: 72,
    target: 80,
    revenue: 4320.0,
  },
  {
    id: "3",
    name: "Denim Jacket",
    sales: 65,
    target: 75,
    revenue: 3900.0,
  },
  {
    id: "4",
    name: "Cargo Pants",
    sales: 58,
    target: 70,
    revenue: 2900.0,
  },
  {
    id: "5",
    name: "Sneakers Pro",
    sales: 45,
    target: 60,
    revenue: 2700.0,
  },
];

// Products Data
const productsData = [
  {
    _id: "507f1f77bcf86cd799439011",
    name: "Classic White T-Shirt",
    sku: "TS-001",
    category: "T-shirts",
    price: 29.99,
    stock: 150,
    status: "In Stock",
    description: "Premium cotton classic white t-shirt",
    images: ["/images/tshirt1.jpg", "/images/tshirt2.jpg"],
    featured: true,
    rating: 4.5,
    reviews: 128,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-03-15T14:20:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439012",
    name: "Premium Hoodie",
    sku: "HD-001",
    category: "Hoodies",
    price: 59.99,
    stock: 75,
    status: "In Stock",
    description: "Comfortable premium hoodie",
    images: ["/images/hoodie1.jpg"],
    featured: true,
    rating: 4.8,
    reviews: 95,
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-03-14T16:45:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439013",
    name: "Denim Jacket",
    sku: "DJ-001",
    category: "Jackets",
    price: 89.99,
    stock: 45,
    status: "Low Stock",
    description: "Classic denim jacket",
    images: ["/images/jacket1.jpg", "/images/jacket2.jpg"],
    featured: false,
    rating: 4.3,
    reviews: 67,
    createdAt: "2024-02-01T11:20:00Z",
    updatedAt: "2024-03-13T10:30:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439014",
    name: "Cargo Pants",
    sku: "CP-001",
    category: "cargo-pants",
    price: 49.99,
    stock: 0,
    status: "Out of Stock",
    description: "Comfortable cargo pants",
    images: ["/images/cargo1.jpg"],
    featured: false,
    rating: 4.1,
    reviews: 42,
    createdAt: "2024-02-10T08:45:00Z",
    updatedAt: "2024-03-12T15:20:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439015",
    name: "Sneakers Pro",
    sku: "SN-001",
    category: "Sneakers",
    price: 79.99,
    stock: 60,
    status: "In Stock",
    description: "Professional sneakers",
    images: ["/images/sneakers1.jpg", "/images/sneakers2.jpg"],
    featured: true,
    rating: 4.7,
    reviews: 89,
    createdAt: "2024-02-15T13:10:00Z",
    updatedAt: "2024-03-11T12:00:00Z",
  },
];

// Orders Data
const ordersData = [
  {
    _id: "507f1f77bcf86cd799439021",
    orderNumber: "ORD-2024-001",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 234 567 8900",
    },
    items: [
      {
        productId: "507f1f77bcf86cd799439011",
        name: "Classic White T-Shirt",
        quantity: 2,
        price: 29.99,
        total: 59.98,
      },
    ],
    total: 59.98,
    status: "Pending",
    paymentStatus: "Paid",
    shippingAddress: "123 Main St, City, Country",
    createdAt: "2024-03-15T10:30:00Z",
    updatedAt: "2024-03-15T10:30:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439022",
    orderNumber: "ORD-2024-002",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 234 567 8901",
    },
    items: [
      {
        productId: "507f1f77bcf86cd799439012",
        name: "Premium Hoodie",
        quantity: 1,
        price: 59.99,
        total: 59.99,
      },
    ],
    total: 59.99,
    status: "Shipped",
    paymentStatus: "Paid",
    shippingAddress: "456 Oak St, City, Country",
    createdAt: "2024-03-14T14:20:00Z",
    updatedAt: "2024-03-15T09:15:00Z",
  },
  {
    _id: "507f1f77bcf86cd799439023",
    orderNumber: "ORD-2024-003",
    customer: {
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1 234 567 8902",
    },
    items: [
      {
        productId: "507f1f77bcf86cd799439013",
        name: "Denim Jacket",
        quantity: 1,
        price: 89.99,
        total: 89.99,
      },
    ],
    total: 89.99,
    status: "Delivered",
    paymentStatus: "Paid",
    shippingAddress: "789 Pine St, City, Country",
    createdAt: "2024-03-13T16:45:00Z",
    updatedAt: "2024-03-14T11:30:00Z",
  },
];

// Customers Data
const customersData = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 8900",
    address: "123 Main St, City, Country",
    status: "Active",
    joinDate: "2024-01-15",
    totalOrders: 12,
    totalSpent: 1499.85,
    lastOrder: "2024-03-15",
    avatar: "/avatars/john.jpg",
    notes: "VIP customer, prefers express shipping",
    tags: ["VIP", "Regular"],
    rating: 4.8,
    reviews: 8,
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 234 567 8901",
    address: "456 Oak St, City, Country",
    status: "Active",
    joinDate: "2024-02-01",
    totalOrders: 5,
    totalSpent: 749.95,
    lastOrder: "2024-03-14",
    avatar: "/avatars/jane.jpg",
    notes: "Prefers email communication",
    tags: ["Regular"],
    rating: 4.5,
    reviews: 3,
  },
  {
    _id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+1 234 567 8902",
    address: "789 Pine St, City, Country",
    status: "Inactive",
    joinDate: "2023-12-10",
    totalOrders: 3,
    totalSpent: 299.97,
    lastOrder: "2024-02-28",
    avatar: "/avatars/mike.jpg",
    notes: "No special preferences",
    tags: ["New"],
    rating: 4.2,
    reviews: 2,
  },
  {
    _id: "4",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    phone: "+1 234 567 8903",
    address: "321 Elm St, City, Country",
    status: "Active",
    joinDate: "2024-01-20",
    totalOrders: 8,
    totalSpent: 899.92,
    lastOrder: "2024-03-10",
    avatar: "/avatars/sarah.jpg",
    notes: "Loyal customer, always buys in bulk",
    tags: ["Loyal", "Bulk Buyer"],
    rating: 5.0,
    reviews: 5,
  },
  {
    _id: "5",
    name: "David Brown",
    email: "david@example.com",
    phone: "+1 234 567 8904",
    address: "654 Maple St, City, Country",
    status: "Blocked",
    joinDate: "2023-11-05",
    totalOrders: 2,
    totalSpent: 199.98,
    lastOrder: "2024-01-15",
    avatar: "/avatars/david.jpg",
    notes: "Account blocked due to payment issues",
    tags: ["Blocked"],
    rating: 2.5,
    reviews: 1,
  },
];

// Promotions Data
const promotionsData = [
  {
    _id: "1",
    code: "WELCOME20",
    discount: 20,
    type: "percentage",
    minAmount: 50,
    maxDiscount: 100,
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    usageLimit: 1000,
    usedCount: 245,
    status: "Active",
    description: "Welcome discount for new customers",
  },
  {
    _id: "2",
    code: "SAVE10",
    discount: 10,
    type: "percentage",
    minAmount: 30,
    maxDiscount: 50,
    validFrom: "2024-03-01",
    validTo: "2024-03-31",
    usageLimit: 500,
    usedCount: 123,
    status: "Active",
    description: "March savings promotion",
  },
  {
    _id: "3",
    code: "FLAT50",
    discount: 50,
    type: "fixed",
    minAmount: 100,
    maxDiscount: 50,
    validFrom: "2024-02-15",
    validTo: "2024-04-15",
    usageLimit: 200,
    usedCount: 89,
    status: "Active",
    description: "Flat discount on orders above $100",
  },
];

// Export all dummy data functions
export const dummyDataAPI = {
  // Dashboard APIs
  dashboard: {
    getStats: async () => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return { data: dashboardStats };
    },
    getSalesTrend: async () => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to fetch sales trend");
      }
      return { data: salesTrendData };
    },
    getCategoryDistribution: async () => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to fetch category distribution");
      }
      return { data: categoryDistribution };
    },
    getRecentActivities: async () => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to fetch recent activities");
      }
      return { data: recentActivities };
    },
    getTopProducts: async () => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to fetch top products");
      }
      return { data: topProducts };
    },
  },

  // Products APIs
  products: {
    getProducts: async (params = {}) => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to fetch products");
      }
      return { data: { products: productsData } };
    },
    getProductById: async (id) => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to fetch product");
      }
      const product = productsData.find((p) => p._id === id);
      if (!product) {
        throw new Error("Product not found");
      }
      return { data: product };
    },
    createProduct: async (productData) => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to create product");
      }
      const newProduct = {
        _id: generateId(),
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      productsData.push(newProduct);
      return { data: newProduct };
    },
    updateProduct: async (id, productData) => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to update product");
      }
      const index = productsData.findIndex((p) => p._id === id);
      if (index === -1) {
        throw new Error("Product not found");
      }
      productsData[index] = {
        ...productsData[index],
        ...productData,
        updatedAt: new Date().toISOString(),
      };
      return { data: productsData[index] };
    },
    deleteProduct: async (id) => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to delete product");
      }
      const index = productsData.findIndex((p) => p._id === id);
      if (index === -1) {
        throw new Error("Product not found");
      }
      productsData.splice(index, 1);
      return { data: { message: "Product deleted successfully" } };
    },
    bulkDeleteProducts: async (ids) => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to delete products");
      }
      ids.forEach((id) => {
        const index = productsData.findIndex((p) => p._id === id);
        if (index !== -1) {
          productsData.splice(index, 1);
        }
      });
      return { data: { message: "Products deleted successfully" } };
    },
  },

  // Orders APIs
  orders: {
    getOrders: async () => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to fetch orders");
      }
      return { data: { orders: ordersData } };
    },
    updateOrder: async (id, orderData) => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to update order");
      }
      const index = ordersData.findIndex((o) => o._id === id);
      if (index === -1) {
        throw new Error("Order not found");
      }
      ordersData[index] = {
        ...ordersData[index],
        ...orderData,
        updatedAt: new Date().toISOString(),
      };
      return { data: ordersData[index] };
    },
  },

  // Customers APIs
  customers: {
    getCustomers: async () => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to fetch customers");
      }
      return { data: { customers: customersData } };
    },
  },

  // Promotions APIs
  promotions: {
    getPromotions: async () => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to fetch promotions");
      }
      return { data: { promotions: promotionsData } };
    },
    createPromotion: async (promotionData) => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to create promotion");
      }
      const newPromotion = {
        _id: generateId(),
        ...promotionData,
        usedCount: 0,
      };
      promotionsData.push(newPromotion);
      return { data: newPromotion };
    },
  },

  // Upload APIs
  upload: {
    uploadImage: async (file) => {
      await simulateApiDelay(1000);
      if (simulateError()) {
        throw new Error("Failed to upload image");
      }
      // Simulate file upload response
      return {
        data: {
          url: `/uploads/${Date.now()}-${file.name}`,
          filename: file.name,
          size: file.size,
        },
      };
    },
  },

  // Auth APIs
  auth: {
    login: async (credentials) => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Invalid credentials");
      }
      // Simulate successful login
      if (
        credentials.email === "admin@beaten.com" &&
        credentials.password === "admin123"
      ) {
        return {
          data: {
            token: "dummy-jwt-token-" + Date.now(),
            user: {
              id: "1",
              name: "Admin User",
              email: "admin@beaten.com",
              role: "admin",
            },
          },
        };
      } else {
        throw new Error("Invalid email or password");
      }
    },
    register: async (userData) => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Registration failed");
      }
      return {
        data: {
          token: "dummy-jwt-token-" + Date.now(),
          user: {
            id: generateId(),
            ...userData,
            role: "admin",
          },
        },
      };
    },
    getMe: async () => {
      await simulateApiDelay();
      if (simulateError()) {
        throw new Error("Failed to get user info");
      }
      return {
        data: {
          id: "1",
          name: "Admin User",
          email: "admin@beaten.com",
          role: "admin",
        },
      };
    },
  },
};
