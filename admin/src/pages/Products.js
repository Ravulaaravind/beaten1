import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Checkbox,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  Badge,
  Avatar,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  DialogContentText,
  Divider,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  AttachMoney as PriceIcon,
  AddPhotoAlternate as AddPhotoIcon,
} from "@mui/icons-material";
import {
  getProducts,
  createProduct,
  bulkDeleteProducts,
  updateProduct,
  deleteProduct,
} from "../api/productsAdmin";
import { uploadAdminAPI } from "../api/uploadAdmin";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingButton } from "@mui/lab";

const categories = [
  "T-shirts",
  "Shirts",
  "Bottom Wear",
  "Hoodies",
  "Jackets",
  "Co-ord Sets",
  "Dresses",
];

const collections = [
  "Beaten Exclusive Collection",
  "Beaten Launch Sale Vol 1",
  "Beaten Signature Collection",
  "New Arrivals",
  "Best Sellers",
  "Summer Collection",
  "Winter Collection",
];

const sizes = ["S", "M", "L", "XL", "XXL"];
const fits = ["Slim", "Oversized", "Regular"];
const genders = ["MEN", "WOMEN"];

const statuses = ["All", "In Stock", "Out of Stock"];
const sortOptions = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "price_asc", label: "Price (Low to High)" },
  { value: "price_desc", label: "Price (High to Low)" },
  { value: "stock_asc", label: "Stock (Low to High)" },
  { value: "stock_desc", label: "Stock (High to Low)" },
  { value: "rating_desc", label: "Rating (High to Low)" },
  { value: "created_desc", label: "Newest First" },
  { value: "sold_desc", label: "Sold Count (High to Low)" }, // Added
];

function Products() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sortBy, setSortBy] = useState("created_desc");
  const [view, setView] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      console.log("API Response:", res);

      // Handle the backend response structure
      const productsData = res.data.data || res.data;
      console.log("Final products array:", productsData);

      // Check if we have valid products with _id
      if (Array.isArray(productsData) && productsData.length > 0) {
        console.log("Sample product _id:", productsData[0]._id);
        console.log("Sample product structure:", productsData[0]);
      } else {
        console.log("No products found or invalid data structure");
      }

      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]); // Set empty array instead of mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [
    searchTerm,
    selectedCategory,
    selectedStatus,
    priceRange,
    showOnlyFeatured,
    sortBy,
  ]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleOpenDialog = (product = null) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedProducts(getFilteredProducts().map((product) => product._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    try {
      await bulkDeleteProducts(selectedProducts);
      console.log("Bulk delete successful");
      await fetchProducts(); // Refresh products after bulk delete
      setSelectedProducts([]); // Clear selection
    } catch (error) {
      console.error("Failed to bulk delete products:", error);
      setFormError("Failed to delete selected products. Please try again.");
    }
  };

  const handleBulkUpdate = () => {
    // Implement bulk update functionality
    console.log("Updating products:", selectedProducts);
  };

  const handleExport = () => {
    const csvContent = getFilteredProducts()
      .map(
        (product) =>
          `${product.sku || "N/A"},${product.name},${product.category},${product.price},${product.stockQuantity || 0},${product.inStock ? "In Stock" : "Out of Stock"}`
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleSwitchToEdit = () => {
    setViewDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeleteLoadingId(productToDelete._id);
    try {
      await deleteProduct(productToDelete._id);
      await fetchProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Failed to delete product:", error);
      setFormError("Failed to delete product.");
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleUpdateProduct = async (id, updatedData) => {
    try {
      await updateProduct(id, updatedData);
      await fetchProducts();
      setEditDialogOpen(false);
      setSelectedProduct(null);
      setFormError(""); // Clear any previous errors
    } catch (error) {
      console.error("Failed to update product:", error);
      setFormError("Failed to update product. Please try again.");
    }
  };

  // Remove duplicate sortOptions - using the one defined at the top

  // Function to get filtered and sorted products
  const getFilteredProducts = useCallback(() => {
    return products
      .filter((product) => {
        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(searchLower) ||
          (product.sku && product.sku.toLowerCase().includes(searchLower));

        // Category filter
        const matchesCategory =
          selectedCategory === "All" || product.category === selectedCategory;

        // Status filter
        const matchesStatus =
          selectedStatus === "All" ||
          (selectedStatus === "In Stock" && product.inStock) ||
          (selectedStatus === "Out of Stock" && !product.inStock);

        // Price range filter
        const minPrice = priceRange.min ? parseFloat(priceRange.min) : null;
        const maxPrice = priceRange.max ? parseFloat(priceRange.max) : null;
        const matchesPrice =
          (!minPrice || product.price >= minPrice) &&
          (!maxPrice || product.price <= maxPrice);

        // Featured filter
        const matchesFeatured = !showOnlyFeatured || product.featured;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus &&
          matchesPrice &&
          matchesFeatured
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name_asc":
            return a.name.localeCompare(b.name);
          case "name_desc":
            return b.name.localeCompare(a.name);
          case "price_asc":
            return a.price - b.price;
          case "price_desc":
            return b.price - a.price;
          case "stock_asc":
            return (a.stockQuantity || 0) - (b.stockQuantity || 0);
          case "stock_desc":
            return (b.stockQuantity || 0) - (a.stockQuantity || 0);
          case "rating_desc":
            return (b.rating || 0) - (a.rating || 0);
          case "created_desc":
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case "sold_desc":
            return (b.soldCount || 0) - (a.soldCount || 0); // Added
          default:
            return 0;
        }
      });
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedStatus,
    priceRange,
    showOnlyFeatured,
    sortBy,
  ]);

  const getStatusColor = (inStock) => {
    return inStock ? "success" : "error";
  };

  const getStatusText = (inStock) => {
    return inStock ? "In Stock" : "Out of Stock";
  };

  const ProductCard = ({ product }) => (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent>
        <Box sx={{ position: "relative", mb: 2 }}>
          <Avatar
            src={product.image || "/default-product.png"}
            variant="rounded"
            sx={{ width: "100%", height: 200 }}
          />
          {product.discount > 0 && (
            <Chip
              label={`${product.discount}% OFF`}
              color="error"
              size="small"
              sx={{ position: "absolute", top: 8, right: 8 }}
            />
          )}
        </Box>
        <Typography variant="h6" gutterBottom noWrap>
          {product.name}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip label={product.category} size="small" icon={<CategoryIcon />} />
          <Chip
            label={getStatusText(product.inStock)}
            color={getStatusColor(product.inStock)}
            size="small"
            icon={<InventoryIcon />}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          SKU: {product.sku || "N/A"}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h6" color="primary">
            ₹{product.price.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stock: {product.stockQuantity || 0}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewProduct(product)}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditProduct(product)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(product)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );

  const ImageUpload = ({ images, onImagesChange }) => {
    const handleImageUpload = (event) => {
      const files = Array.from(event.target.files);
      const newImages = files.map((file) => ({
        url: URL.createObjectURL(file),
        file: file,
        name: file.name,
      }));
      onImagesChange([...images, ...newImages]);
    };

    const handleRemoveImage = (index) => {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    };

    return (
      <Box>
        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="image-upload"
            type="file"
            multiple
            onChange={handleImageUpload}
          />
          <label htmlFor="image-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
            >
              Upload Images
            </Button>
          </label>
        </Box>
        {images.length > 0 && (
          <ImageList
            sx={{ width: "100%", height: 120 }}
            cols={5}
            rowHeight={100}
          >
            {images.map((image, index) => (
              <ImageListItem key={index} sx={{ position: "relative" }}>
                <img
                  src={image.url}
                  alt={`Product ${index + 1}`}
                  loading="lazy"
                  style={{
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(255,255,255,0.7)",
                    zIndex: 2,
                  }}
                  size="small"
                  onClick={() => handleRemoveImage(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ImageListItem>
            ))}
            <ImageListItem>
              <label htmlFor="image-upload">
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed",
                    borderColor: "divider",
                    cursor: "pointer",
                  }}
                >
                  <AddPhotoIcon
                    sx={{ fontSize: 32, color: "text.secondary" }}
                  />
                </Box>
              </label>
            </ImageListItem>
          </ImageList>
        )}
      </Box>
    );
  };

  const ViewProductDialog = ({ open, onClose, product }) => {
    if (!product) return null;

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ position: "relative", width: "100%", height: 300 }}>
                <img
                  src={product.image || "/default-product.png"}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                {product.discount > 0 && (
                  <Chip
                    label={`${product.discount}% OFF`}
                    color="error"
                    size="small"
                    sx={{ position: "absolute", top: 16, right: 16 }}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Product Name
              </Typography>
              <Typography variant="h6" gutterBottom>
                {product.name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                SKU
              </Typography>
              <Typography variant="body1" gutterBottom>
                {product.sku}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Price
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                ₹{product.price.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Stock
              </Typography>
              <Typography variant="body1" gutterBottom>
                {product.stockQuantity || 0} units
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Category
              </Typography>
              <Chip
                label={product.category}
                size="small"
                icon={<CategoryIcon />}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={getStatusText(product.inStock)}
                color={getStatusColor(product.inStock)}
                size="small"
                icon={<InventoryIcon />}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Additional Information
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Stack direction="row" spacing={2}>
                  <Chip label={`Rating: ${product.rating}`} size="small" />
                  <Chip label={`${product.reviews} Reviews`} size="small" />
                  <Chip
                    label={product.featured ? "Featured" : "Regular"}
                    color={product.featured ? "primary" : "default"}
                    size="small"
                  />
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            variant="contained"
            onClick={handleSwitchToEdit}
            startIcon={<EditIcon />}
          >
            Edit Product
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const EditProductDialog = ({ open, onClose, product = null }) => {
    const [formData, setFormData] = useState({
      name: product?.name || "",
      sku: product?.sku || "",
      price: product?.price || "",
      originalPrice: product?.originalPrice || "",
      stockQuantity: product?.stockQuantity || 0,
      category: product?.category || "",
      subCategory: product?.subCategory || "",
      collectionName: product?.collectionName || "",
      gender: product?.gender || "",
      sizes: product?.sizes || [],
      colors: product?.colors || [],
      fit: product?.fit || "",
      description: product?.description || "",
      features: product?.features || [],
      specifications: {
        Material: product?.specifications?.Material || "",
        Fit: product?.specifications?.Fit || "",
        Care: product?.specifications?.Care || "",
        Origin: product?.specifications?.Origin || "",
      },
      inStock: product?.inStock !== undefined ? product.inStock : true,
      rating: product?.rating || 0,
      reviews: product?.reviews || 0,
      tags: product?.tags || [],
      discount: product?.discount || 0,
      isFeatured: product?.isFeatured || false,
      isNewArrival: product?.isNewArrival || false,
      isBestSeller: product?.isBestSeller || false,
      soldCount: product?.soldCount || 0,
      images: product?.images || [],
    });

    const [submitLoading, setSubmitLoading] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleImagesChange = (newImages) => {
      setFormData((prev) => ({
        ...prev,
        images: newImages,
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormError("");
      setSubmitLoading(true);
      // Check for at least one image selected
      if (!formData.images || formData.images.length === 0) {
        toast.error("Please select at least one image.");
        setSubmitLoading(false);
        return;
      }
      try {
        if (
          !formData.name ||
          !formData.price ||
          !formData.category ||
          !formData.subCategory ||
          !formData.collectionName ||
          !formData.gender ||
          !formData.description
        ) {
          toast.error("Please fill in all required fields marked with *.");
          setSubmitLoading(false);
          return;
        }
        // Upload all images to backend and get URLs
        let imageUrls = [];
        if (formData.images && formData.images.length > 0) {
          try {
            imageUrls = await Promise.all(
              formData.images.map(async (img) => {
                if (img.file) {
                  const uploadRes = await uploadAdminAPI.uploadImage(img.file);
                  return uploadRes.data.imageUrl;
                } else if (img.url) {
                  // If already a URL (e.g. editing), use as is
                  return img.url;
                } else if (typeof img === "string") {
                  return img;
                }
                return null;
              })
            );
          } catch (err) {
            toast.error(
              "Failed to upload one or more images. Please try again."
            );
            setSubmitLoading(false);
            return;
          }
        }
        // Always send images as an array, even if only one
        if (!Array.isArray(imageUrls)) imageUrls = imageUrls ? [imageUrls] : [];
        // Ensure at least one image in the array if imageUrl exists
        if ((!imageUrls || imageUrls.length === 0) && imageUrl) {
          imageUrls = [imageUrl];
        }
        // Use the first image as the main image
        const imageUrl = imageUrls[0] || "";
        const payload = {
          ...formData,
          image: imageUrl,
          images: imageUrls,
        };
        if (!payload.fit) delete payload.fit;
        delete payload.images;
        if (!imageUrl) {
          toast.error(
            "Please upload/select an image before saving the product. Image is required."
          );
          setSubmitLoading(false);
          return;
        }
        if (!product) {
          try {
            await createProduct(payload);
            await fetchProducts();
            onClose();
            toast.success("Product created successfully!");
          } catch (error) {
            console.error("Failed to create product:", error);
            toast.error("Failed to create product. Please try again.");
          }
        } else {
          try {
            await handleUpdateProduct(product._id, payload);
            await fetchProducts();
            onClose();
            toast.success("Product updated successfully!");
          } catch (error) {
            console.error("Failed to update product:", error);
            toast.error("Failed to update product. Please try again.");
          }
        }
      } finally {
        setSubmitLoading(false);
      }
    };

    const BACKEND_URL =
      process.env.REACT_APP_API_URL || "http://localhost:8000";

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {product ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <Alert severity="info" sx={{ mb: 2 }}>
              Fields marked with * are required
            </Alert>
            <Grid container spacing={2}>
              {/* Product Images Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Product Images *
                </Typography>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                />
                {/* Image Preview */}
                {formData.images && formData.images.length > 0 && (
                  <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                    {formData.images.map((img, idx) => {
                      let url = img.url || img;
                      if (url && !url.startsWith("http")) {
                        url = url; // Keep as is for dummy data
                      }
                      return (
                        <img
                          key={idx}
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          style={{
                            maxWidth: 120,
                            maxHeight: 120,
                            borderRadius: 8,
                            border: "1px solid #eee",
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Product Details Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Product Details *
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description *"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>
                    Category <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category *"
                    onChange={handleChange}
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Sub Category *"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>
                    Collection <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  <Select
                    name="collectionName"
                    value={formData.collectionName}
                    label="Collection *"
                    onChange={handleChange}
                    required
                  >
                    {collections.map((collection) => (
                      <MenuItem key={collection} value={collection}>
                        {collection}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>
                    Gender <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    label="Gender *"
                    onChange={handleChange}
                    required
                  >
                    {genders.map((gender) => (
                      <MenuItem key={gender} value={gender}>
                        {gender}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>
                    Fit <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  <Select
                    name="fit"
                    value={formData.fit}
                    label="Fit *"
                    onChange={handleChange}
                  >
                    <MenuItem value="">None</MenuItem>
                    {fits.map((fit) => (
                      <MenuItem key={fit} value={fit}>
                        {fit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Price *"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Original Price"
                  name="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Discount (%)"
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Inventory Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Inventory
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  name="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.inStock}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          inStock: e.target.checked,
                        }))
                      }
                      name="inStock"
                    />
                  }
                  label="In Stock"
                />
              </Grid>
              {/* Sizes and Colors Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Sizes & Colors
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>
                    Sizes <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  <Select
                    multiple
                    name="sizes"
                    value={formData.sizes}
                    label="Sizes *"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sizes: e.target.value,
                      }))
                    }
                    renderValue={(selected) => selected.join(", ")}
                  >
                    {sizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Colors (comma separated)"
                  name="colors"
                  value={formData.colors.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      colors: e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter((c) => c),
                    }))
                  }
                  placeholder="Red, Blue, Green"
                />
              </Grid>

              {/* Product Flags Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Product Flags
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isBestSeller}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isBestSeller: e.target.checked,
                        }))
                      }
                      name="isBestSeller"
                      color="primary"
                    />
                  }
                  label="Best Seller"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isFeatured: e.target.checked,
                        }))
                      }
                      name="isFeatured"
                      color="primary"
                    />
                  }
                  label="Featured"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isNewArrival}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isNewArrival: e.target.checked,
                        }))
                      }
                      name="isNewArrival"
                      color="primary"
                    />
                  }
                  label="New Arrival"
                />
              </Grid>

              {/* Specifications Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Specifications
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Features (comma separated)"
                  name="features"
                  value={formData.features.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      features: e.target.value
                        .split(",")
                        .map((f) => f.trim())
                        .filter((f) => f),
                    }))
                  }
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  name="tags"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t),
                    }))
                  }
                  placeholder="Tag 1, Tag 2, Tag 3"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={submitLoading}
            >
              {product ? "Update Product" : "Add Product"}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    );
  };

  const renderTableActions = (product) => (
    <TableCell>
      <Tooltip title="View Details">
        <IconButton size="small" onClick={() => handleViewProduct(product)}>
          <ViewIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => handleEditProduct(product)}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDeleteClick(product)}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </TableCell>
  );

  return (
    <Box>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Products</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => {
              
            }}
          >
            Import
          </Button> */}
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="All">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={handleStatusChange}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              More Filters
            </Button>
          </Grid> */}
        </Grid>

        {showFilters && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Min Price"
                  type="number"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                  }
                  InputProps={{ startAdornment: <PriceIcon /> }}
                />
                <TextField
                  label="Max Price"
                  type="number"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                  }
                  InputProps={{ startAdornment: <PriceIcon /> }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyFeatured}
                    onChange={(e) => setShowOnlyFeatured(e.target.checked)}
                  />
                }
                label="Show Featured Only"
              />
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography>{selectedProducts.length} products selected</Typography>
            <Button variant="outlined" color="error" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
            <Button variant="outlined" onClick={handleBulkUpdate}>
              Update Selected
            </Button>
          </Box>
        </Paper>
      )}

      {/* Results Summary */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {getFilteredProducts().length} of {products.length} products
          {(searchTerm ||
            selectedCategory !== "All" ||
            selectedStatus !== "All" ||
            priceRange.min ||
            priceRange.max ||
            showOnlyFeatured) && <span> (filtered)</span>}
        </Typography>
        {getFilteredProducts().length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Page {page + 1} of{" "}
            {Math.ceil(getFilteredProducts().length / rowsPerPage)}
          </Typography>
        )}
      </Box>

      {/* View Toggle */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={view}
          onChange={(e, newValue) => setView(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab value="list" label="List View" />
          <Tab value="grid" label="Grid View" />
        </Tabs>
      </Box>

      {/* Products Display */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <Typography>Loading products...</Typography>
        </Box>
      ) : getFilteredProducts().length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <Typography>No products found</Typography>
        </Box>
      ) : view === "list" ? (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer>
            <Table stickyHeader sx={{ border: 1, borderColor: "divider" }}>
              <TableHead>
                <TableRow sx={{ border: 1, borderColor: "divider" }}>
                  <TableCell
                    padding="checkbox"
                    sx={{ border: 1, borderColor: "divider" }}
                  >
                    <Checkbox
                      checked={
                        selectedProducts.length === getFilteredProducts().length
                      }
                      indeterminate={
                        selectedProducts.length > 0 &&
                        selectedProducts.length < getFilteredProducts().length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: "divider" }}>
                    SKU
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: "divider" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: "divider" }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: "divider" }}>
                    Price
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: "divider" }}>
                    Stock
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: "divider" }}>
                    Sold Count
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: "divider" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: "divider" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredProducts()
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                    <TableRow
                      key={product._id}
                      sx={{ border: 1, borderColor: "divider" }}
                    >
                      <TableCell
                        padding="checkbox"
                        sx={{ border: 1, borderColor: "divider" }}
                      >
                        <Checkbox
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                        />
                      </TableCell>
                      <TableCell sx={{ border: 1, borderColor: "divider" }}>
                        {product.sku}
                      </TableCell>
                      <TableCell sx={{ border: 1, borderColor: "divider" }}>
                        {product.name}
                      </TableCell>
                      <TableCell sx={{ border: 1, borderColor: "divider" }}>
                        {product.category}
                      </TableCell>
                      <TableCell sx={{ border: 1, borderColor: "divider" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          ₹{product.price.toFixed(2)}
                          {product.discount > 0 && (
                            <Chip
                              label={`${product.discount}% OFF`}
                              color="error"
                              size="small"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ border: 1, borderColor: "divider" }}>
                        {product.stockQuantity || 0}
                      </TableCell>
                      <TableCell sx={{ border: 1, borderColor: "divider" }}>
                        {product.soldCount || 0}
                      </TableCell>
                      <TableCell sx={{ border: 1, borderColor: "divider" }}>
                        <Chip
                          label={getStatusText(product.inStock)}
                          color={getStatusColor(product.inStock)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ border: 1, borderColor: "divider" }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewProduct(product)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditProduct(product)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={getFilteredProducts().length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {getFilteredProducts()
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <ProductCard product={product} />
              </Grid>
            ))}
        </Grid>
      )}

      {/* Product Dialog */}
      <ViewProductDialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        product={selectedProduct}
      />
      <EditProductDialog
        open={openDialog}
        onClose={handleCloseDialog}
        product={null}
      />
      <EditProductDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        product={selectedProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{productToDelete?.name}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={!!deleteLoadingId}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            loading={!!deleteLoadingId}
            disabled={!!deleteLoadingId}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Products;
