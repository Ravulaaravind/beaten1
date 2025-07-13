import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  Pagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Drawer,
  useMediaQuery,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowBack as ArrowBackIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import axios from "axios";
import { useWishlist } from "../context/WishlistContext";
import { API_ENDPOINTS, buildApiUrl, handleApiError } from "../utils/api";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";

import {
  mockProducts,
  categories,
  collections,
  searchProducts,
} from "../data/mockData";

const sizeOptions = ["S", "M", "L", "XL", "XXL"];
const fitOptions = ["Slim", "Oversized", "Regular"];
// Get all unique colors from products
const colorOptions = []; // or compute from products if needed

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect fill="%23f5f5f5" width="200" height="200"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="20">Image</text></svg>';
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const getImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("blob:")) {
    return imagePath;
  }
  if (imagePath && !imagePath.includes("/")) {
    return `${BASE_URL}/uploads/${imagePath}`;
  }
  return imagePath;
};

// Image loading state component
const ProductImage = ({ product, mode, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");

  useEffect(() => {
    const imageUrl = getImageUrl(product.image);
    setCurrentSrc(imageUrl);
    setImageLoaded(false);
    setImageError(false);
  }, [product.image]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    setCurrentSrc(FALLBACK_IMAGE);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
        minHeight: { xs: 320, md: 480 },
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <CardMedia
        component="img"
        sx={{
          height: { xs: 320, md: 480 },
          width: "100%",
          objectFit: "cover",
          borderRadius: 0,
          transition: "opacity 0.3s ease",
          opacity: imageLoaded ? 1 : 0,
        }}
        image={currentSrc}
        alt={product.name}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {!imageLoaded && !imageError && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              border: "3px solid #e0e0e0",
              borderTop: "3px solid #666",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

const Products = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlist();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    gender: [],
    category: [],
    subCategory: [],
    collectionName: [],
    priceRange: [0, 10000],
    sort: "newest",
    size: [],
    color: [],
    fit: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [activeChip, setActiveChip] = useState("all");
  // Add a loading skeleton state for demo
  const [showLoading, setShowLoading] = useState(false);
  const [shopAllActive, setShopAllActive] = useState(false);

  // Use imported categories and collections data

  // Filter products by selected filters (category, etc.)
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products;

    // Gender filter
    if (filters.gender && filters.gender.length > 0) {
      filtered = filtered.filter((p) =>
        filters.gender.some(
          (gender) =>
            p.gender && p.gender.toLowerCase() === gender.toLowerCase()
        )
      );
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      let categoryFiltered = filtered.filter((p) =>
        filters.category.some(
          (cat) => p.category && p.category.toLowerCase() === cat.toLowerCase()
        )
      );
      // If no products match the exact category, fall back to name match
      if (categoryFiltered.length === 0) {
        categoryFiltered = filtered.filter((p) =>
          filters.category.some(
            (cat) => p.name && p.name.toLowerCase().includes(cat.toLowerCase())
          )
        );
      }
      filtered = categoryFiltered;
    }

    // SubCategory filter with improved logic
    if (filters.subCategory && filters.subCategory.length > 0) {
      filtered = filtered.filter((p) =>
        filters.subCategory.some((subCat) => {
          // Check exact subCategory match
          if (
            p.subCategory &&
            p.subCategory.toLowerCase() === subCat.toLowerCase()
          ) {
            return true;
          }

          // Check if subCategory is in product name
          if (p.name && p.name.toLowerCase().includes(subCat.toLowerCase())) {
            return true;
          }

          // Special handling for specific subcategories
          if (subCat.toLowerCase() === "cargo pants") {
            return (
              p.category === "Bottom Wear" &&
              (p.subCategory === "Cargo Pants" ||
                p.name.toLowerCase().includes("cargo"))
            );
          }

          if (subCat.toLowerCase() === "oversized") {
            return (
              (p.category === "T-shirts" && p.subCategory === "Oversized") ||
              p.fit === "Oversized" ||
              p.name.toLowerCase().includes("oversized")
            );
          }

          if (subCat.toLowerCase() === "co-ord sets") {
            return (
              p.category === "Co-ord Sets" ||
              p.name.toLowerCase().includes("co-ord")
            );
          }

          return false;
        })
      );
    }

    // Collection filter
    if (filters.collectionName && filters.collectionName.length > 0) {
      filtered = filtered.filter((p) =>
        filters.collectionName.some(
          (collection) =>
            p.collectionName &&
            p.collectionName.toLowerCase() === collection.toLowerCase()
        )
      );
    }

    // Price range filter
    if (filters.priceRange && filters.priceRange.length === 2) {
      filtered = filtered.filter((p) => {
        const price = parseFloat(p.price) || 0;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // Size filter
    if (filters.size && filters.size.length > 0) {
      filtered = filtered.filter((p) => {
        if (!p.sizes || !Array.isArray(p.sizes)) return false;
        return filters.size.some((size) => p.sizes.includes(size));
      });
    }

    // Fit filter
    if (filters.fit && filters.fit.length > 0) {
      filtered = filtered.filter((p) =>
        filters.fit.some(
          (fit) => p.fit && p.fit.toLowerCase() === fit.toLowerCase()
        )
      );
    }

    // Color filter
    if (filters.color && filters.color.length > 0) {
      filtered = filtered.filter((p) => {
        if (!p.colors || !Array.isArray(p.colors)) return false;
        return filters.color.some((color) =>
          p.colors.some(
            (productColor) => productColor.toLowerCase() === color.toLowerCase()
          )
        );
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.subCategory?.toLowerCase().includes(query) ||
          p.collectionName?.toLowerCase().includes(query)
      );
    }

    // Sorting
    let sorted = [...filtered];
    switch (filters.sort) {
      case "price_asc":
        sorted.sort(
          (a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)
        );
        break;
      case "price_desc":
        sorted.sort(
          (a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)
        );
        break;
      case "popular":
        // Sort by soldCount (popularity)
        sorted.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      case "newest":
      default:
        // Sort by creation date or ID (newest first)
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
    }

    return sorted;
  }, [products, filters, searchQuery]);

  // Handlers
  const handleFilterChange = (filter, value) => {
    if (
      filter !== "category" ||
      (filter === "category" && !value.includes("Shop All"))
    ) {
      setShopAllActive(false);
    }
    if (filter === "category" && value.includes("Shop All")) {
      setShopAllActive(true);
    }
    setFilters((prev) => {
      if (filter === "gender") {
        return {
          ...prev,
          gender: value,
          category: [],
          subCategory: [],
        };
      }
      if (filter === "category" && value.includes("Shop All")) {
        return {
          gender: [],
          category: [],
          subCategory: [],
          collectionName: [],
          priceRange: [0, 10000],
          sort: "newest",
          size: [],
          color: [],
          fit: [],
        };
      }
      return {
        ...prev,
        [filter]: value,
      };
    });
    setPage(1);
    if (
      filter === "gender" ||
      (filter === "category" && value.includes("Shop All"))
    ) {
      setTimeout(fetchProducts, 0);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
      console.log("Navigating to cart...");
      navigate("/cart");
      console.log("Navigation to cart done");
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleWishlistToggle = (productId) => {
    try {
      const productToToggle = products.find((p) => p._id === productId);
      if (!productToToggle) {
        console.error("Product not found:", productId);
        return;
      }

      if (isInWishlist(productId)) {
        removeFromWishlist(productId);
      } else {
        const productToAdd = {
          _id: productToToggle._id,
          name: productToToggle.name,
          price: productToToggle.price,
          image: productToToggle.image,
          description: productToToggle.description,
          category: productToToggle.category,
          subCategory: productToToggle.subCategory,
          collectionName: productToToggle.collectionName,
          colors: productToToggle.colors,
          gender: productToToggle.gender,
        };
        addToWishlist(productToAdd);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter options
  const genderOptions = ["Men", "Women"];

  const filterBody = (
    <>
      {/* Gender */}
      <Accordion
        defaultExpanded
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<FilterIcon fontSize="small" />}
          aria-controls="gender-panel-content"
          id="gender-panel-header"
        >
          <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
            Gender ({filters.gender.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2 }}>
          <FormGroup>
            {genderOptions.map((gender) => (
              <FormControlLabel
                key={gender}
                control={
                  <Checkbox
                    checked={filters.gender[0] === gender}
                    onChange={(e) => {
                      const singleGender = e.target.checked ? [gender] : [];
                      handleFilterChange("gender", singleGender);
                    }}
                    size="small"
                  />
                }
                label={gender}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                    color: "text.secondary",
                  },
                }}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Categories */}
      <Accordion
        defaultExpanded
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<FilterIcon fontSize="small" />}
          aria-controls="category-panel-content"
          id="category-panel-header"
        >
          <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
            Categories ({filters.category.length + filters.subCategory.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2 }}>
          <FormGroup>
            {/* Shop All */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={shopAllActive}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setShopAllActive(true);
                      handleFilterChange("category", ["Shop All"]);
                      handleFilterChange("subCategory", []);
                    } else {
                      setShopAllActive(false);
                      handleFilterChange("category", []);
                    }
                  }}
                  size="small"
                />
              }
              label="Shop All"
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.875rem",
                  color: "text.secondary",
                },
              }}
            />

            {/* MEN Section */}
            <Box sx={{ mt: 1 }}>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                MEN
              </Typography>
              {Object.entries(categories["MEN"]).map(([mainCat, subCats]) => (
                <Box key={mainCat} sx={{ ml: 2, mb: 2 }}>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  >
                    {mainCat}
                  </Typography>
                  <Box sx={{ ml: 1 }}>
                    {subCats.map((subCat) => (
                      <FormControlLabel
                        key={subCat}
                        control={
                          <Checkbox
                            checked={filters.subCategory.includes(subCat)}
                            onChange={(e) => {
                              const newSubCategories = e.target.checked
                                ? [...filters.subCategory, subCat]
                                : filters.subCategory.filter(
                                    (c) => c !== subCat
                                  );
                              handleFilterChange(
                                "subCategory",
                                newSubCategories
                              );
                            }}
                            size="small"
                          />
                        }
                        label={subCat}
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            fontSize: "0.875rem",
                            color: "text.secondary",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* WOMEN Section */}
            <Box sx={{ mt: 2 }}>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                WOMEN
              </Typography>
              {Object.entries(categories["WOMEN"]).map(([mainCat, subCats]) => (
                <Box key={mainCat} sx={{ ml: 2, mb: 2 }}>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  >
                    {mainCat}
                  </Typography>
                  <Box sx={{ ml: 1 }}>
                    {subCats.map((subCat) => (
                      <FormControlLabel
                        key={subCat}
                        control={
                          <Checkbox
                            checked={filters.subCategory.includes(subCat)}
                            onChange={(e) => {
                              const newSubCategories = e.target.checked
                                ? [...filters.subCategory, subCat]
                                : filters.subCategory.filter(
                                    (c) => c !== subCat
                                  );
                              handleFilterChange(
                                "subCategory",
                                newSubCategories
                              );
                            }}
                            size="small"
                          />
                        }
                        label={subCat}
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            fontSize: "0.875rem",
                            color: "text.secondary",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Collections */}
      <Accordion
        defaultExpanded
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<FilterIcon fontSize="small" />}
          aria-controls="collection-panel-content"
          id="collection-panel-header"
        >
          <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
            Collections ({filters.collectionName.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2 }}>
          <FormGroup>
            {collections.map((collection) => (
              <FormControlLabel
                key={collection}
                control={
                  <Checkbox
                    checked={filters.collectionName.includes(collection)}
                    onChange={(e) => {
                      const newCollections = e.target.checked
                        ? [...filters.collectionName, collection]
                        : filters.collectionName.filter(
                            (c) => c !== collection
                          );
                      handleFilterChange("collectionName", newCollections);
                    }}
                    size="small"
                  />
                }
                label={collection}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                    color: "text.secondary",
                  },
                }}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Price Range */}
      <Accordion
        defaultExpanded
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<FilterIcon fontSize="small" />}
          aria-controls="price-panel-content"
          id="price-panel-header"
        >
          <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
            Price Range
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2 }}>
          <Slider
            value={filters.priceRange}
            onChange={(e, newValue) =>
              handleFilterChange("priceRange", newValue)
            }
            valueLabelDisplay="auto"
            min={0}
            max={10000}
            step={500}
            valueLabelFormat={(value) => `₹${value}`}
            sx={{
              "& .MuiSlider-thumb": {
                width: 12,
                height: 12,
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.875rem", color: "text.secondary" }}
            >
              ₹{filters.priceRange[0]}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.875rem", color: "text.secondary" }}
            >
              ₹{filters.priceRange[1]}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        defaultExpanded
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<FilterIcon fontSize="small" />}
          aria-controls="size-panel-content"
          id="size-panel-header"
        >
          <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
            Size ({filters.size.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2 }}>
          <FormGroup row>
            {sizeOptions.map((size) => (
              <FormControlLabel
                key={size}
                control={
                  <Checkbox
                    checked={filters.size.includes(size)}
                    onChange={(e) => {
                      const newSizes = e.target.checked
                        ? [...filters.size, size]
                        : filters.size.filter((s) => s !== size);
                      handleFilterChange("size", newSizes);
                    }}
                    size="small"
                  />
                }
                label={size}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                    color: "text.secondary",
                  },
                }}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      <Accordion
        defaultExpanded
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<FilterIcon fontSize="small" />}
          aria-controls="fit-panel-content"
          id="fit-panel-header"
        >
          <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
            Fit ({filters.fit.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2 }}>
          <FormGroup row>
            {fitOptions.map((fit) => (
              <FormControlLabel
                key={fit}
                control={
                  <Checkbox
                    checked={filters.fit.includes(fit)}
                    onChange={(e) => {
                      const newFits = e.target.checked
                        ? [...filters.fit, fit]
                        : filters.fit.filter((f) => f !== fit);
                      handleFilterChange("fit", newFits);
                    }}
                    size="small"
                  />
                }
                label={fit}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                    color: "text.secondary",
                  },
                }}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Color Filter */}
      <Accordion
        defaultExpanded
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<FilterIcon fontSize="small" />}
          aria-controls="color-panel-content"
          id="color-panel-header"
        >
          <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
            Color ({filters.color.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2 }}>
          <FormGroup row>
            {[
              "Black",
              "White",
              "Blue",
              "Red",
              "Green",
              "Yellow",
              "Pink",
              "Purple",
              "Brown",
              "Gray",
            ].map((color) => (
              <FormControlLabel
                key={color}
                control={
                  <Checkbox
                    checked={filters.color.includes(color)}
                    onChange={(e) => {
                      const newColors = e.target.checked
                        ? [...filters.color, color]
                        : filters.color.filter((c) => c !== color);
                      handleFilterChange("color", newColors);
                    }}
                    size="small"
                  />
                }
                label={color}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                    color: "text.secondary",
                  },
                }}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </>
  );

  // Mobile sticky header
  const mobileHeader = (
    <Box
      sx={{
        display: { xs: "flex", md: "none" },
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1201,
        bgcolor: "background.paper",
        px: 2,
        py: 1.5,
        borderBottom: "1px solid #eee",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      {/* Grid view icon on left */}
      <IconButton
        onClick={() => setViewMode("grid")}
        color={viewMode === "grid" ? "primary" : "default"}
      >
        <ViewModuleIcon />
      </IconButton>
      {/* Search icon in center */}
      <IconButton>
        <SearchIcon />
      </IconButton>
      {/* Filter icon on right */}
      <IconButton onClick={() => setDrawerOpen(true)}>
        <FilterIcon />
      </IconButton>
    </Box>
  );

  // For mobile chips, use only subcategories for category chips (not 'MEN'/'WOMEN')
  const subCategoryOptions = [
    ...Object.values(categories["MEN"] || {}).flat(),
    ...Object.values(categories["WOMEN"] || {}).flat(),
  ];

  const chipSet = new Set();
  const uniqueChips = [
    // Gender chips
    ...genderOptions.map((option) => ({
      label: option,
      filterKey: "gender",
      value: option,
    })),
    // Remove main category chips (MEN, WOMEN)
    // CollectionName chips
    ...collections.map((collection) => ({
      label: collection,
      filterKey: "collectionName",
      value: collection,
    })),
    // Remove size chips
    // Fit chips
    ...fitOptions.map((fit) => ({
      label: fit,
      filterKey: "fit",
      value: fit,
    })),
  ];

  const mobileChips = (
    <Box
      sx={{
        display: { xs: "flex", md: "none" },
        overflowX: "auto",
        gap: 0,
        px: 0,
        py: 0,
        bgcolor: "background.paper",
        borderBottom: "none",
        position: "sticky",
        top: 44, // changed from 48 to 56 to match header height
        left: 0,
        width: "100%",
        zIndex: 1200,
        mt: 0,
        borderTop: "none",
        boxShadow: "none",
        mb: 0,
        pb: 0,
        // No margin or border at the top
        "&::-webkit-scrollbar": {
          display: "none",
        },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      {uniqueChips.map((chip) => (
        <Chip
          key={chip.filterKey + "-" + chip.value}
          label={chip.label}
          clickable
          onClick={() => {
            const isActive = filters[chip.filterKey].includes(chip.value);
            if (isActive) {
              // Deselect all filters
              handleFilterChange(chip.filterKey, []);
            } else {
              // Clear all filters, then set only this chip as active
              setFilters({
                gender: chip.filterKey === "gender" ? [chip.value] : [],
                category: [],
                subCategory: [],
                collectionName:
                  chip.filterKey === "collectionName" ? [chip.value] : [],
                priceRange: [0, 10000],
                sort: "newest",
                size: [],
                color: [],
                fit: chip.filterKey === "fit" ? [chip.value] : [],
              });
              setPage(1);
            }
          }}
          sx={{
            height: 32,
            borderRadius: 0,
            bgcolor: filters[chip.filterKey].includes(chip.value)
              ? "primary.main"
              : "background.paper",
            color: filters[chip.filterKey].includes(chip.value)
              ? "white"
              : "text.primary",
            border: "1px solid",
            borderColor: filters[chip.filterKey].includes(chip.value)
              ? "primary.main"
              : "rgba(0, 0, 0, 0.12)",
            mx: 0, // Remove horizontal margin
            px: 0, // Remove horizontal padding
            "&:hover": {
              bgcolor: filters[chip.filterKey].includes(chip.value)
                ? "primary.dark"
                : "rgba(0, 0, 0, 0.04)",
            },
            "& .MuiChip-label": {
              px: 1.2, // Reduce label padding
              fontWeight: 500,
              fontSize: "0.875rem",
            },
          }}
        />
      ))}
    </Box>
  );

  // Add a function to fetch products
  const fetchProducts = async () => {
    setShowLoading(true);
    try {
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.PRODUCTS));
      setProducts(response.data.data || []);
    } catch (err) {
      const error = handleApiError(err);
      setError(error.message || "Failed to load products");
    } finally {
      setShowLoading(false);
    }
  };

  // Update useEffect to use fetchProducts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Add a floating filter button for mobile view
  const mobileFilterFab = (
    <Box
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 80, // Move up to avoid covering bottom nav
        right: 20,
        zIndex: 1300,
        pointerEvents: "auto",
      }}
    >
      <IconButton
        size="large"
        color="primary"
        sx={{
          bgcolor: "primary.main",
          color: "white",
          boxShadow: 4,
          width: 44, // Decrease size
          height: 44, // Decrease size
          borderRadius: "50%",
          "&:hover": { bgcolor: "primary.dark" },
          fontSize: 24, // Decrease icon size
        }}
        onClick={() => setDrawerOpen(true)}
        aria-label="Open filters"
      >
        <FilterIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );

  // Set collectionName and category filter from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const collectionNameParam = params.get("collectionName");
    const categoryParam = params.get("category");
    setFilters((prev) => ({
      ...prev,
      collectionName: collectionNameParam
        ? [collectionNameParam]
        : prev.collectionName,
      category: categoryParam ? [categoryParam] : prev.category,
    }));
  }, [location.search]);

  return (
    <Box
      sx={{
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "inherit",
        minHeight: "100vh",
        transition: "background 0.3s, color 0.3s",
        pb: { xs: 0, md: 4 },
        mb: 0,
      }}
    >
      {/* Edge-to-edge Search Bar */}
      <Box
        sx={{
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          transform: "translateX(-50%)",
          bgcolor: mode === "dark" ? "#181818" : "#fff",
          zIndex: 10,
          mb: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery("")}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
      </Box>
      <Container maxWidth="xl" disableGutters={isMobile} sx={{ pb: { xs: 0, md: 4 }, mb: 0 }}>
        {/* Mobile custom header and chips */}
        {isMobile && (
          <>
            {/* Mobile Product Count */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                justifyContent: "center",
                alignItems: "center",
                py: 0,
                px: 2,
                borderBottom: "1px solid #eee",
                mt: 0,
                mb: 0,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                {filteredAndSortedProducts.length} Products
              </Typography>
            </Box>
            {mobileChips}
          </>
        )}
        <Grid container spacing={{ xs: 0, md: 3 }} sx={{ mt: 0, pt: 0 }}>
          {/* Restore desktop sidebar filter */}
          <Grid
            item
            xs={12}
            md={2.5}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Paper
              sx={{
                p: 2,
                display: { xs: "none", md: "block" },
                position: "sticky",
                top: "100px",
                maxHeight: "calc(100vh - 100px)",
                overflowY: "auto",
              }}
            >
              {filterBody}
            </Paper>
          </Grid>

          {/* Products Grid */}
          <Grid item xs={12} md={9.5} sx={{ pt: 0, mt: 0 }}>
            {/* Desktop Sort and View Controls */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                px: 0,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {filteredAndSortedProducts.length} Products
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                    displayEmpty
                    sx={{ fontSize: "0.875rem" }}
                  >
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="price_asc">Price: Low to High</MenuItem>
                    <MenuItem value="price_desc">Price: High to Low</MenuItem>
                    <MenuItem value="popular">Most Popular</MenuItem>
                  </Select>
                </FormControl>
                <Box
                  sx={{
                    display: "flex",
                    border: "1px solid #ddd",
                    borderRadius: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setViewMode("grid")}
                    color={viewMode === "grid" ? "primary" : "default"}
                    sx={{ borderRadius: 0 }}
                  >
                    <ViewModuleIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setViewMode("list")}
                    color={viewMode === "list" ? "primary" : "default"}
                    sx={{ borderRadius: 0 }}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Products Grid/List */}
            <Grid container spacing={0}>
              {showLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Grid item xs={6} sm={6} md={3} key={i}>
                    <Card
                      sx={{
                        borderRadius: 0,
                        boxShadow: 2,
                        minHeight: 320,
                        p: 0,
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        sx={{ borderRadius: 0, height: { xs: 320, md: 480 } }}
                      />
                      <Box sx={{ p: 1 }}>
                        <Skeleton width="80%" />
                        <Skeleton width="60%" />
                        <Skeleton width="40%" />
                      </Box>
                    </Card>
                  </Grid>
                ))
              ) : filteredAndSortedProducts.length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No products found matching your criteria
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                filteredAndSortedProducts.map((product, index) => (
                  <Grid
                    item
                    key={product._id}
                    xs={6}
                    sm={6}
                    md={viewMode === "grid" ? 3 : 12}
                  >
                    <Fade in timeout={400 + index * 60}>
                      <Card
                        elevation={0}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: viewMode === "grid" ? "column" : "row",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 0,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                          minHeight: 320,
                          bgcolor: "background.paper",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            "& .MuiCardMedia-root": {
                              transform: "scale(1.03)",
                            },
                          },
                        }}
                        onClick={() => handleProductClick(product._id)}
                      >
                        <CardActionArea
                          component="div"
                          sx={{
                            display: "flex",
                            flexDirection:
                              viewMode === "grid" ? "column" : "row",
                            alignItems: "stretch",
                          }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              overflow: "hidden",
                            }}
                          >
                            <ProductImage
                              product={product}
                              mode={mode}
                              onClick={() => handleProductClick(product._id)}
                            />
                            {/* Wishlist Button */}
                            <Fade in>
                              <IconButton
                                aria-label="add to wishlist"
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  bgcolor: "rgba(255, 255, 255, 0.95)",
                                  borderRadius: "50%",
                                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                  width: 30,
                                  height: 30,
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    bgcolor: "#fff",
                                    transform: "scale(1.05)",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                                  },
                                  zIndex: 1,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWishlistToggle(product._id);
                                }}
                              >
                                {isInWishlist(product._id) ? (
                                  <FavoriteIcon
                                    sx={{
                                      color: "#ff1744",
                                      fontSize: 18,
                                      transition: "all 0.2s ease",
                                    }}
                                  />
                                ) : (
                                  <FavoriteBorderIcon
                                    sx={{
                                      color: "rgba(0, 0, 0, 0.4)",
                                      fontSize: 18,
                                      transition: "all 0.2s ease",
                                    }}
                                  />
                                )}
                              </IconButton>
                            </Fade>
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              p: 1.2,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              minHeight: 80,
                            }}
                          >
                            <Typography
                              gutterBottom
                              variant="subtitle1"
                              component="div"
                              sx={{
                                fontWeight: 500,
                                fontSize: "0.95rem",
                                mb: 0.5,
                                lineHeight: 1.2,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color: "text.primary",
                                transition: "color 0.2s ease",
                                "&:hover": {
                                  color: "primary.main",
                                },
                              }}
                            >
                              {product.name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "1rem",
                                }}
                              >
                                {formatPrice(product.price)}
                              </Typography>
                              {product.discount && (
                                <Typography
                                  variant="body2"
                                  color="error"
                                  sx={{
                                    fontWeight: 500,
                                    ml: 1,
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {product.discount}% OFF
                                </Typography>
                              )}
                            </Box>
                            {/* Color swatches */}
                            {product.colors && product.colors.length > 0 && (
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 0.5,
                                  mt: 0.5,
                                }}
                              >
                                {product.colors.slice(0, 3).map((color) => (
                                  <Tooltip key={color} title={color} arrow>
                                    <Box
                                      sx={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: "50%",
                                        bgcolor: color
                                          .toLowerCase()
                                          .replace(" ", ""),
                                        border: "1px solid #ddd",
                                        mr: 0.5,
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                          transform: "scale(1.1)",
                                          borderColor: "#999",
                                        },
                                      }}
                                    />
                                  </Tooltip>
                                ))}
                                {product.colors.length > 3 && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      ml: 0.5,
                                      color: "text.secondary",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    +{product.colors.length - 3}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        </CardActionArea>
                      </Card>
                    </Fade>
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Mobile Filter Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          variant="temporary"
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: "100%",
              maxWidth: 320,
              boxSizing: "border-box",
              bgcolor: "background.paper",
              borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
              top: 80,
              height: "calc(100vh - 80px)",
            },
          }}
          PaperProps={{
            sx: {
              position: "fixed",
              top: 80,
              right: 0,
              height: "calc(100vh - 80px)",
              overflow: "hidden",
            },
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Drawer Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                position: "sticky",
                top: 0,
                bgcolor: "background.paper",
                zIndex: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontSize: "1.1rem", fontWeight: 600 }}
              >
                Sort
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Only Sort Dropdown for Mobile Drawer */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
              }}
            >
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  displayEmpty
                  sx={{ fontSize: "1rem" }}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="price_asc">Price: Low to High</MenuItem>
                  <MenuItem value="price_desc">Price: High to Low</MenuItem>
                  <MenuItem value="popular">Most Popular</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Drawer>
      </Container>
      {isMobile && !drawerOpen && mobileFilterFab}
    </Box>
  );
};

export default Products;
