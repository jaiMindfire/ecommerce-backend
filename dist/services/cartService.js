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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutService = exports.massAddItemsToCart = exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.addToCart = exports.getCartByUserId = void 0;
// 3rd Party Imports
const mongoose_1 = __importDefault(require("mongoose"));
const worker_threads_1 = require("worker_threads");
// Static Imports
const Cart_1 = require("@models/Cart");
const Product_1 = require("@models/Product");
const databaseErrorHandler_1 = require("@utils/databaseErrorHandler");
const customError_1 = require("@utils/customError");
const redis_1 = require("src/config/redis");
//Retrieves the shopping cart for a specific user by their user ID.
const getCartByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = new mongoose_1.default.Types.ObjectId(userId);
        return yield Cart_1.Cart.findOne({ user: id }).populate("items.product").lean();
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        return null; // Ensures a null return on error.
    }
});
exports.getCartByUserId = getCartByUserId;
//Adds an item to the user's cart or updates the quantity if it already exists.
const addToCart = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, productId, quantity } = input;
    try {
        const product = yield Product_1.Product.findById(productId);
        if (!product)
            throw new customError_1.CustomError("Product not found", 404);
        if (product.stock < quantity)
            throw new customError_1.CustomError("Insufficient stock", 400);
        let cart = yield Cart_1.Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart_1.Cart({
                user: userId,
                items: [{ product: productId, quantity }],
            });
        }
        else {
            const itemIndex = cart.items.findIndex((item) => (item === null || item === void 0 ? void 0 : item.product.toString()) === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            }
            else {
                const productObjectId = new mongoose_1.default.Types.ObjectId(productId);
                cart.items.push({
                    product: productObjectId,
                    quantity,
                });
            }
        }
        yield cart.save();
        return yield cart.populate("items.product");
    }
    catch (error) {
        if (error instanceof customError_1.CustomError) {
            throw error;
        }
        (0, databaseErrorHandler_1.handleDbError)(error);
        return null;
    }
});
exports.addToCart = addToCart;
//Updates the quantity of a specific item in the user's cart.
const updateCartItem = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, productId, quantity } = input;
    try {
        const product = yield Product_1.Product.findById(productId);
        if (!product)
            throw new customError_1.CustomError("Product not found", 404);
        if (product.stock < quantity)
            throw new customError_1.CustomError("Insufficient stock", 400);
        const cart = yield Cart_1.Cart.findOne({ user: userId });
        if (!cart)
            throw new customError_1.CustomError("Cart not found", 404);
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (itemIndex === -1)
            throw new customError_1.CustomError("Product not in cart", 404);
        if (quantity === 0) {
            cart.items.splice(itemIndex, 1);
        }
        else {
            cart.items[itemIndex].quantity = quantity;
        }
        yield cart.save();
        return yield cart.populate("items.product");
    }
    catch (error) {
        if (error instanceof customError_1.CustomError) {
            throw error;
        }
        (0, databaseErrorHandler_1.handleDbError)(error);
        return null;
    }
});
exports.updateCartItem = updateCartItem;
//Removes a specific item from the user's cart based on product ID.
const removeCartItem = (userId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield Cart_1.Cart.findOne({ user: userId });
        if (!cart)
            throw new customError_1.CustomError("Cart not found", 404);
        cart.items = cart.items.filter((item) => item.product.toString() !== productId);
        yield cart.save();
        return yield cart.populate("items.product");
    }
    catch (error) {
        if (error instanceof customError_1.CustomError) {
            throw error;
        }
        (0, databaseErrorHandler_1.handleDbError)(error);
        return null;
    }
});
exports.removeCartItem = removeCartItem;
//Clears the entire cart for a specific user by deleting it from the database.
const clearCart = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Cart_1.Cart.findOneAndDelete({ user: userId });
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
    }
});
exports.clearCart = clearCart;
//Adds multiple items to the user's cart, ensuring no duplicates are added.
const massAddItemsToCart = (userId, items) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let cart = yield Cart_1.Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart_1.Cart({ user: userId, items: [] });
        }
        const existingProductIds = cart.items.map((item) => item.product.toString());
        // Offload filtering to a worker thread
        const worker = new worker_threads_1.Worker("./src/utils/cartWorker.ts");
        const workerPayload = { existingProductIds, newItems: items };
        const filteredItems = yield new Promise((resolve, reject) => {
            worker.postMessage({ type: "filterItems", payload: workerPayload });
            worker.on("message", (message) => {
                if (message.type === "filteredItems") {
                    resolve(message.payload);
                }
            });
            worker.on("error", reject);
        });
        // Push filtered items into the cart
        filteredItems.forEach((item) => {
            cart.items.push({
                product: item.product._id,
                quantity: item.quantity,
            });
        });
        yield cart.save();
        return cart;
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
    }
});
exports.massAddItemsToCart = massAddItemsToCart;
// Processes the checkout by reducing product stock according to cart items, and clears the cart after successful checkout.
//Uses a transaction to ensure data integrity.
const checkoutService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const cart = yield Cart_1.Cart.findOne({ user: userId }).session(session);
        if (!cart || cart.items.length === 0) {
            throw new customError_1.CustomError("Cart is empty", 400);
        }
        const productIds = cart.items.map((item) => item.product);
        const products = yield Product_1.Product.find({ _id: { $in: productIds } }).session(session);
        const bulkOperations = [];
        for (const cartItem of cart.items) {
            const product = products.find((p) => p._id.toString() === cartItem.product.toString());
            if (!product) {
                yield session.abortTransaction();
                throw new customError_1.CustomError(`Product with ID ${cartItem.product} not found`, 404);
            }
            if (product.stock < cartItem.quantity) {
                yield session.abortTransaction();
                throw new customError_1.CustomError(`Insufficient stock for product: ${product.name}`, 400);
            }
            const cacheKey = `product:${product._id}`;
            yield redis_1.redisClient.del(cacheKey);
            bulkOperations.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: { $inc: { stock: -cartItem.quantity } },
                },
            });
        }
        yield Product_1.Product.bulkWrite(bulkOperations, { session });
        cart.items = [];
        yield cart.save({ session });
        yield session.commitTransaction();
    }
    catch (error) {
        yield session.abortTransaction();
        if (error instanceof customError_1.CustomError) {
            throw error;
        }
        (0, databaseErrorHandler_1.handleDbError)(error);
    }
    finally {
        session.endSession();
    }
});
exports.checkoutService = checkoutService;
