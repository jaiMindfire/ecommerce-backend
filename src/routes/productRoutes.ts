import express from "express";
import {
  getProducts,
  getProduct,
  createNewProduct,
  updateProductController,
  deleteProductController,
  searchProductController,
} from "../controllers/productController";
import { authenticateJWT } from "../middlewares/authentication";
import { authorizeRoles } from "../middlewares/authorization";
import { productValidation } from "../middlewares/validators";

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", getProducts);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get("/:id", getProduct);

// @route   POST /api/products
// @desc    Create a new product
// @access  Admin
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
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  deleteProductController
);

// @route   GET /api/products/search?q=keyword
// @desc    Search products
// @access  Public
router.get("/search", searchProductController);

export default router;
