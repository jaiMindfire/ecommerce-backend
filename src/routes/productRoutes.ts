import express from "express";
import {
  getProducts,
  getProduct,
  createNewProduct,
  updateProductController,
  deleteProductController,
  searchProductController,
  getCategoriesController,
} from "../controllers/productController";
import { authenticateJWT } from "../middlewares/authentication";
import { authorizeRoles } from "../middlewares/authorization";
import { productValidation } from "../middlewares/validators";

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
// @request { query: { page: "number", limit: "number", search: "string", priceRange: "string", categories: "string", rating: "number" } }
// @response { success: true, data: [ IProduct ], pagination: { totalItems: "number", totalPages: "number", currentPage: "number" } }
router.get("/", getProducts);

// @route   GET /api/products/categories
// @desc    Get all categories
// @access  Public
// @request {}
// @response { categories: [ "category1", "category2", ... ] }
router.get("/categories", getCategoriesController);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
// @request { params: { id: "string" } }
// @response { IProduct }
router.get("/:id", getProduct);

// @route   POST /api/products
// @desc    Create a new product
// @access  Admin
// @request { body: { name: "string", price: "number", description: "string", category: "string", ... } }
// @response { message: "Product created successfully", product: {IProduct} }
router.post(
  "/",
  authenticateJWT,
  authorizeRoles(["admin"]),
  productValidation,
  createNewProduct
);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Admin
// @request { params: { id: "string" }, body: { name: "string", price: "number", description: "string", ... } }
// @response { message: "Product updated successfully", product: {IProduct } }
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  productValidation.map((validation) => validation.optional()),
  updateProductController
);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Admin
// @request { params: { id: "string" } }
// @response { message: "Product deleted successfully" }
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  deleteProductController
);

// @route   GET /api/products/search?q=keyword
// @desc    Search products
// @access  Public
// @request { query: { q: "string" } }
// @response { products: [ { Iproduct } ] }
router.get("/search", searchProductController);

export default router;
