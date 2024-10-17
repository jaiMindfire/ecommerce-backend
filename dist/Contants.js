"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_MESSAGES = exports.PRODUCT_MESSAGES = exports.CART_MESSAGES = exports.LOGIN_MESSAGES = exports.DATABASE_ERROR_MESSAGE = exports.DATABASE_SUCCESS_MESSAGE = void 0;
exports.DATABASE_SUCCESS_MESSAGE = "MongoDB Connected Successfully";
exports.DATABASE_ERROR_MESSAGE = "MongoDB Connection Error:";
exports.LOGIN_MESSAGES = {
    userRegistered: "User registered successfully",
    loginSuccess: "Logged in successfully",
    validationError: "Validation error",
    userNotFound: "User not found",
    serverError: "An error occurred, please try again later",
};
exports.CART_MESSAGES = {
    cartNotFound: "Cart not found",
    itemAdded: "Item added to cart",
    cartUpdated: "Cart updated successfully",
    itemRemoved: "Item removed from cart",
    checkoutSuccess: "Checkout completed successfully",
    cartUpdatedBulk: "Cart updated successfully",
    cartUpdateError: "An error occurred while updating the cart",
};
exports.PRODUCT_MESSAGES = {
    productNotFound: "Product not found",
    productCreated: "Product created successfully",
    productUpdated: "Product updated successfully",
    productDeleted: "Product deleted successfully",
    searchQueryRequired: "Search query is required",
};
exports.AUTH_MESSAGES = {
    authTokenMissing: "Authorization token missing",
    invalidOrExpiredToken: "Invalid or expired token",
};
