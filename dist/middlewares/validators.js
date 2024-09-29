"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartUpdateValidation = exports.cartAddValidation = exports.productValidation = exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];
exports.loginValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
exports.productValidation = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Product name is required"),
    (0, express_validator_1.body)("description").notEmpty().withMessage("Product description is required"),
    (0, express_validator_1.body)("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    (0, express_validator_1.body)("imageUrl").isURL().withMessage("Valid image URL is required"),
    (0, express_validator_1.body)("stock")
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),
];
exports.cartAddValidation = [
    (0, express_validator_1.body)("productId").notEmpty().withMessage("Product ID is required"),
    (0, express_validator_1.body)("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];
exports.cartUpdateValidation = [
    (0, express_validator_1.body)("productId").notEmpty().withMessage("Product ID is required"),
    (0, express_validator_1.body)("quantity").isInt({ min: 0 }).withMessage("Quantity must be at least 0"),
];
