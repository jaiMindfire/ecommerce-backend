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
exports.massAddToCart = exports.checkoutCart = exports.removeItemFromCart = exports.updateCart = exports.addItemToCart = exports.getCart = void 0;
const cartService_1 = require("../services/cartService");
const express_validator_1 = require("express-validator");
const getCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield (0, cartService_1.getCartByUserId)(req.userData.id);
        if (!cart)
            return res.status(404).json({ message: "Cart not found" });
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
});
exports.getCart = getCart;
const addItemToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { productId, quantity } = req.body;
        const cart = yield (0, cartService_1.addToCart)({
            userId: req.userData.id,
            productId,
            quantity,
        });
        res.status(200).json({
            message: "Item added to cart",
            cart,
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addItemToCart = addItemToCart;
const updateCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { productId, quantity } = req.body;
        const cart = yield (0, cartService_1.updateCartItem)({
            userId: req.userData.id,
            productId,
            quantity,
        });
        res.json({
            message: "Cart updated successfully",
            cart,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateCart = updateCart;
const removeItemFromCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const cart = yield (0, cartService_1.removeCartItem)(req.userData.id, productId);
        res.json({
            message: "Item removed from cart",
            cart,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.removeItemFromCart = removeItemFromCart;
const checkoutCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, cartService_1.checkoutService)(req.userData.id);
        res.status(200).json({ message: "Checkout completed successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.checkoutCart = checkoutCart;
const massAddToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { items } = req.body;
    const userId = req.userData.id;
    try {
        const updatedCart = yield (0, cartService_1.massAddItemsToCart)(userId, items);
        res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            data: updatedCart,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the cart",
        });
    }
});
exports.massAddToCart = massAddToCart;
