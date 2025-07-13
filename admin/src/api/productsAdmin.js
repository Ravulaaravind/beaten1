// Real Products API - Connects to backend
import { productsAPI } from "./axiosAdmin";

// Get all products
export const getProducts = (params) => productsAPI.getProducts(params);

// Get a single product by ID
export const getProductById = (id) => productsAPI.getProductById(id);

// Create a new product
export const createProduct = (productData) =>
  productsAPI.createProduct(productData);

// Update a product by ID
export const updateProduct = (id, productData) =>
  productsAPI.updateProduct(id, productData);

// Delete a product by ID
export const deleteProduct = (id) => productsAPI.deleteProduct(id);

// Bulk delete products
export const bulkDeleteProducts = (ids) => productsAPI.bulkDeleteProducts(ids);
