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
exports.searchProductController = exports.deleteProductController = exports.updateProductController = exports.createNewProduct = exports.getProduct = exports.getProducts = void 0;
const productService_1 = require("../services/productService");
const express_validator_1 = require("express-validator");
const getProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const { products, totalItems } = yield (0, productService_1.getAllProducts)(page, limit, search);
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
        next(error);
    }
});
exports.getProducts = getProducts;
const getProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield (0, productService_1.getProductById)(req.params.id);
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        res.json(product);
    }
    catch (error) {
        next(error);
    }
});
exports.getProduct = getProduct;
const createNewProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const product = yield (0, productService_1.createProduct)(req.body);
        res.status(201).json({
            message: "Product created successfully",
            product,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createNewProduct = createNewProduct;
const updateProductController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield (0, productService_1.updateProduct)(req.params.id, req.body);
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        res.json({
            message: "Product updated successfully",
            product,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProductController = updateProductController;
const deleteProductController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield (0, productService_1.deleteProduct)(req.params.id);
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteProductController = deleteProductController;
const searchProductController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }
        const products = yield (0, productService_1.searchProducts)(query);
        res.json(products);
    }
    catch (error) {
        next(error);
    }
});
exports.searchProductController = searchProductController;
