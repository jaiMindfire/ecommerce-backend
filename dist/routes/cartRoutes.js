"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartController_1 = require("../controllers/cartController");
const authentication_1 = require("../middlewares/authentication");
const express_validator_1 = require("express-validator");
const validators_1 = require("../middlewares/validators");
const router = express_1.default.Router();
router.use(authentication_1.authenticateJWT);
// @route   GET /api/cart
// @desc    Get current user's cart
// @access  User
router.get("/", cartController_1.getCart);
// @route   POST /api/cart
// @desc    Add item to cart
// @access  User
router.post("/", validators_1.cartAddValidation, cartController_1.addItemToCart);
// @route   PUT /api/cart
// @desc    Update cart item
// @access  User
router.put("/", validators_1.cartUpdateValidation, cartController_1.updateCart);
// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  User
router.delete("/:productId", [(0, express_validator_1.param)("productId").notEmpty().withMessage("Product ID is required")], cartController_1.removeItemFromCart);
// @route   POST /api/cart/checkout
// @desc    Checkout cart
// @access  User
router.post("/checkout", cartController_1.checkoutCart);
// @route   POST /api/cart/mass-add
// @desc    Mass insert
// @access  User
router.post("/mass-add", cartController_1.massAddToCart);
exports.default = router;
