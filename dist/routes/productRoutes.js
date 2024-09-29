"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const authentication_1 = require("../middlewares/authentication");
const authorization_1 = require("../middlewares/authorization");
const validators_1 = require("../middlewares/validators");
const router = express_1.default.Router();
// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", productController_1.getProducts);
// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get("/:id", productController_1.getProduct);
// @route   POST /api/products
// @desc    Create a new product
// @access  Admin
router.post("/", authentication_1.authenticateJWT, (0, authorization_1.authorizeRoles)(["admin"]), validators_1.productValidation, productController_1.createNewProduct);
// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Admin
router.put("/:id", authentication_1.authenticateJWT, (0, authorization_1.authorizeRoles)(["admin"]), validators_1.productValidation.map((validation) => validation.optional()), productController_1.updateProductController);
// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Admin
router.delete("/:id", authentication_1.authenticateJWT, (0, authorization_1.authorizeRoles)(["admin"]), productController_1.deleteProductController);
// @route   GET /api/products/search?q=keyword
// @desc    Search products
// @access  Public
router.get("/search", productController_1.searchProductController);
exports.default = router;
