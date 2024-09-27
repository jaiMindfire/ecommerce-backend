import { body } from "express-validator";

export const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const productValidation = [
  body("name").notEmpty().withMessage("Product name is required"),
  body("description").notEmpty().withMessage("Product description is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("imageUrl").isURL().withMessage("Valid image URL is required"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
];

export const cartAddValidation = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

export const cartUpdateValidation = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be at least 0"),
];
