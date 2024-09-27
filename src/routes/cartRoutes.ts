import express, { Router } from "express";
import {
  getCart,
  addItemToCart,
  updateCart,
  removeItemFromCart,
  checkoutCart,
  massAddToCart,
} from "../controllers/cartController";
import { authenticateJWT } from "../middlewares/authentication";
import { body, param } from "express-validator";
import {
  cartAddValidation,
  cartUpdateValidation,
} from "../middlewares/validators";

const router = express.Router();

router.use(authenticateJWT);

// @route   GET /api/cart
// @desc    Get current user's cart
// @access  User
router.get("/", getCart);

// @route   POST /api/cart
// @desc    Add item to cart
// @access  User
router.post("/", cartAddValidation, addItemToCart);

// @route   PUT /api/cart
// @desc    Update cart item
// @access  User
router.put("/", cartUpdateValidation, updateCart);

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  User
router.delete(
  "/:productId",
  [param("productId").notEmpty().withMessage("Product ID is required")],
  removeItemFromCart
);

// @route   POST /api/cart/checkout
// @desc    Checkout cart
// @access  User
router.post("/checkout", checkoutCart);

// @route   POST /api/cart/mass-add
// @desc    Mass insert
// @access  User

router.post("/mass-add", massAddToCart)



export default router;
