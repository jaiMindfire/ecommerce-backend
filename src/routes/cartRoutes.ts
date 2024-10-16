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

router.use(authenticateJWT); // Only authenticated users are allowed to perform all further operations

// @route   GET /api/cart
// @desc    Get current user's cart
// @access  User
// @response { cart: ICart }
router.get("/", getCart);

// @route   POST /api/cart
// @desc    Add item to cart
// @access  User
// @request { "productId": "string", "quantity": number }
// @response { cart: ICart }
router.post("/", cartAddValidation, addItemToCart);

// @route   PUT /api/cart
// @desc    Update cart item
// @access  User
// @request { "productId": "string", "quantity": number }
// @response { cart: ICart }
router.put("/", cartUpdateValidation, updateCart);

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  User
// @request { params: { productId: "string" } }
// @response { cart: ICart }
router.delete(
  "/:productId",
  [param("productId").notEmpty().withMessage("Product ID is required")],
  removeItemFromCart
);

// @route   POST /api/cart/checkout
// @desc    Checkout cart
// @access  User
// @response {message: "string" }
router.post("/checkout", checkoutCart);

// @route   POST /api/cart/mass-add
// @desc    Mass insert items into the cart
// @access  User
// @request { items: [{ productId: "string", quantity: number }] }
router.post("/mass-add", massAddToCart);

export default router;
