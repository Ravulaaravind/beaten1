import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  AttachMoney as RevenueIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { dashboardAPI } from "../api/axiosAdmin";
import { productsAPI } from "../api/axiosAdmin";

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  // Fetch all products for top products logic
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getProducts();
        // Support both { data: [...] } and { data: { products: [...] } }
        const products = response.data.data || response.data.products || [];
        setAllProducts(products);
      } catch (err) {
        // Optionally handle error
        setAllProducts([]);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard analytics in one call
        const response = await dashboardAPI.getDashboardAnalytics();
        const data = response.data.data;

        setStats({
          totalCustomers: data.totalUsers,
          totalOrders: data.totalOrders,
          totalProducts: data.totalProducts,
          totalRevenue: data.totalRevenue,
          growth: {}, // You can add growth calculation if needed
        });

        // Category Distribution
        setCategoryData(
          (data.categoryStats || []).map((cat) => ({
            name: cat._id,
            value: cat.count,
          }))
        );

        // Recent Activities
        setRecentActivities(data.recentActivities || []);

        // Optionally, you can still compute salesData and topProducts from recentActivities or add them to the backend
        setSalesData([]); // Not provided in new endpoint
        setTopProducts([]); // Not provided in new endpoint
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color, growth }) => (
    <Paper
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: 140,
        bgcolor: color,
        color: "white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {icon}
      </Box>
      <Typography variant="h4" component="div" sx={{ mt: 2 }}>
        {value}
      </Typography>
      {growth !== undefined && (
        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          {growth > 0 ? (
            <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: 16, mr: 0.5 }} />
          )}
          <Typography variant="body2">
            {Math.abs(growth).toFixed(1)}% from last month
          </Typography>
        </Box>
      )}
    </Paper>
  );

  const ActivityItem = ({ activity }) => (
    <ListItem>
      <ListItemIcon>
        <CircleIcon
          sx={{
            fontSize: 8,
            color:
              activity.type === "order"
                ? "#2e7d32"
                : activity.type === "customer"
                  ? "#1976d2"
                  : activity.type === "product"
                    ? "#ed6c02"
                    : "#9c27b0",
          }}
        />
      </ListItemIcon>
      <ListItemText primary={activity.message} secondary={activity.time} />
      {activity.amount && (
        <Typography variant="body2" color="text.secondary">
          ₹{activity.amount.toFixed(2)}
        </Typography>
      )}
    </ListItem>
  );

  const ProductProgress = ({ product }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" fontWeight="bold">{product.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {product.soldCount} units sold
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
        ₹{product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} revenue
      </Typography>
      <Divider sx={{ my: 1 }} />
    </Box>
  );

  // Dummy sales trend data for fallback
  const dummySalesData = [
    { name: "2024-01", sales: 10, revenue: 2000 },
    { name: "2024-02", sales: 15, revenue: 3000 },
    { name: "2024-03", sales: 8, revenue: 1600 },
    { name: "2024-04", sales: 20, revenue: 4000 },
    { name: "2024-05", sales: 12, revenue: 2400 },
    { name: "2024-06", sales: 18, revenue: 3600 },
  ];

  // Use dummy data if salesData is empty
  const displaySalesData = useMemo(
    () => (salesData && salesData.length > 0 ? salesData : dummySalesData),
    [salesData]
  );

  // Compute top products by soldCount
  const displayTopProducts = useMemo(() => {
    if (allProducts && allProducts.length > 0) {
      // Sort by soldCount descending, fallback to 0 if missing
      return [...allProducts]
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 5)
        .map((product) => ({
          id: product._id,
          name: product.name,
          soldCount: product.soldCount || 0,
          revenue: (product.soldCount || 0) * (product.price || 0),
        }));
    }
    return [];
  }, [allProducts]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="h6" color="text.secondary">
          Please check your connection and try again
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            icon={<PeopleIcon />}
            color="#1976d2"
            growth={stats?.growth?.customers}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={<OrdersIcon />}
            color="#2e7d32"
            growth={stats?.growth?.orders}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={<ProductsIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${(stats?.totalRevenue || 0).toFixed(2)}`}
            icon={<RevenueIcon />}
            color="#9c27b0"
            growth={stats?.growth?.revenue}
          />
        </Grid>

        {/* Sales Trend and Top Products side by side */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Sales Trend
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={displaySalesData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top Products
            </Typography>
            {displayTopProducts.length > 0 ? (
              displayTopProducts.map((product) => (
                <ProductProgress key={product.id} product={product} />
              ))
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 4,
                  height: "100%",
                }}
              >
                <Typography color="text.secondary">
                  No top products data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Category Distribution */}

        {/* Revenue Distribution */}

        {/* Recent Activities */}

        {/* Top Products */}
      </Grid>
    </Box>
  );
}

export default Dashboard;
