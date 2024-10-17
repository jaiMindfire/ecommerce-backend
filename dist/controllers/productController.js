"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoriesController = exports.searchProductController = exports.deleteProductController = exports.updateProductController = exports.createNewProduct = exports.getProduct = exports.getProducts = void 0;
const express_validator_1 = require("express-validator");
// Static Imports
const productService_1 = require("@services/productService");
const Contants_1 = require("src/Contants");
// Get the products list according to pagination, search, and filters.
const getProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = parseInt(req.query.page) || 1; // Current page number
        const limit = parseInt(req.query.limit) || 10; // Number of items per page
        const search = req.query.search || ""; // Search term
        // Parse price range from query
        const priceRange = req.query.priceRange || "";
        const [minPrice, maxPrice] = priceRange.split(",").map(Number);
        // Parse categories from query
        const categories = req.query.categories
            ? (_a = req.query.categories) === null || _a === void 0 ? void 0 : _a.split(",")
            : [];
        const minRating = parseInt(req.query.rating) || 0; // Minimum rating
        // Fetch products based on the filters
        const { products, totalItems } = yield (0, productService_1.getAllProducts)(page, limit, search, minPrice, maxPrice, minRating, categories);
        // Respond with products and pagination info
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
            },
        });
    }
    catch (error) {
        next(error); // Handle errors, this will send errors to error handling middleware.
    }
});
exports.getProducts = getProducts;
// Get a single product by ID
const getProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield (0, productService_1.getProductById)(req.params.id); // Fetch product by ID
        if (!product)
            return res.status(404).json({ message: Contants_1.PRODUCT_MESSAGES.productNotFound });
        res.json(product); // Respond with product data
    }
    catch (error) {
        next(error); // Handle errors
    }
});
exports.getProduct = getProduct;
// Create a new product
const createNewProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req); // Validate request data
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }); // Return validation errors
        }
        const product = yield (0, productService_1.createProduct)(req.body);
        res.status(201).json({
            message: Contants_1.PRODUCT_MESSAGES.productCreated,
            product,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createNewProduct = createNewProduct;
// Update an existing product
const updateProductController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield (0, productService_1.updateProduct)(req.params.id, req.body); // Update the product
        if (!product)
            return res.status(404).json({ message: Contants_1.PRODUCT_MESSAGES.productNotFound });
        res.json({
            message: Contants_1.PRODUCT_MESSAGES.productUpdated,
            product,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProductController = updateProductController;
// Delete a product
const deleteProductController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield (0, productService_1.deleteProduct)(req.params.id);
        if (!product)
            return res.status(404).json({ message: Contants_1.PRODUCT_MESSAGES.productNotFound });
        res.json({ message: Contants_1.PRODUCT_MESSAGES.productDeleted });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteProductController = deleteProductController;
// Search for products -> Old version, now we are seraching in getProducts controller itself.
const searchProductController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.q; // Get search query
        if (!query) {
            return res.status(400).json({ message: Contants_1.PRODUCT_MESSAGES.searchQueryRequired });
        }
        const products = yield (0, productService_1.searchProducts)(query);
        res.json(products);
    }
    catch (error) {
        next(error);
    }
});
exports.searchProductController = searchProductController;
// Get all product categories -> to be used for filtering in frontend.
const getCategoriesController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, productService_1.getCategories)(); // Fetch categories
        return res.status(200).json(categories);
    }
    catch (error) {
        next(error);
    }
});
exports.getCategoriesController = getCategoriesController;
