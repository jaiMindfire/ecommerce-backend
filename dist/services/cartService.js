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
const mongoose_1 = __importDefault(require("mongoose"));
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const getCartByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const id = new mongoose_1.default.Types.ObjectId(userId);
    return yield Cart_1.Cart.findOne({ user: id }).populate("items.product").lean();
});
exports.getCartByUserId = getCartByUserId;
const addToCart = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, productId, quantity } = input;
    const product = yield Product_1.Product.findById(productId);
    if (!product)
        throw new Error("Product not found");
    if (product.stock < quantity)
        throw new Error("Insufficient stock");
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
});
exports.addToCart = addToCart;
const updateCartItem = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, productId, quantity } = input;
    const product = yield Product_1.Product.findById(productId);
    if (!product)
        throw new Error("Product not found");
    if (product.stock < quantity)
        throw new Error("Insufficient stock");
    const cart = yield Cart_1.Cart.findOne({ user: userId });
    if (!cart)
        throw new Error("Cart not found");
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1)
        throw new Error("Product not in cart");
    if (quantity === 0) {
        cart.items.splice(itemIndex, 1);
    }
    else {
        cart.items[itemIndex].quantity = quantity;
    }
    yield cart.save();
    return yield cart.populate("items.product");
});
exports.updateCartItem = updateCartItem;
const removeCartItem = (userId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield Cart_1.Cart.findOne({ user: userId });
    if (!cart)
        throw new Error("Cart not found");
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    yield cart.save();
    return yield cart.populate("items.product");
});
exports.removeCartItem = removeCartItem;
const clearCart = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield Cart_1.Cart.findOneAndDelete({ user: userId });
});
exports.clearCart = clearCart;
const massAddItemsToCart = (userId, items) => __awaiter(void 0, void 0, void 0, function* () {
    let cart = yield Cart_1.Cart.findOne({ user: userId });
    console.log(userId, 'user');
    if (!cart) {
        cart = new Cart_1.Cart({ user: userId, items: [] });
    }
    const existingProductIds = cart.items.map(item => item.product.toString());
    const newItems = items.filter((item) => !existingProductIds.includes(item.product._id));
    if (newItems.length) {
        items.map((item) => {
            cart.items.push({
                product: item.product._id,
                quantity: item.quantity,
            });
        });
    }
    yield cart.save();
    return cart;
});
exports.massAddItemsToCart = massAddItemsToCart;
const checkoutService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const cart = yield Cart_1.Cart.findOne({ user: userId }).session(session);
        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }
        const productIds = cart.items.map((item) => item.product);
        const products = yield Product_1.Product.find({ _id: { $in: productIds } }).session(session);
        const bulkOperations = [];
        // Validate stock and build bulk operations to decrease stock
        for (const cartItem of cart.items) {
            const product = products.find((p) => p._id.toString() === cartItem.product.toString());
            if (!product) {
                yield session.abortTransaction();
                throw new Error(`Product with ID ${cartItem.product} not found`);
            }
            if (product.stock < cartItem.quantity) {
                yield session.abortTransaction();
                throw new Error(`Insufficient stock for product: ${product.name}`);
            }
            // Prepare bulk operation to decrease stock
            bulkOperations.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: { $inc: { stock: -cartItem.quantity } },
                },
            });
        }
        // Perform the bulk write to update product stocks
        yield Product_1.Product.bulkWrite(bulkOperations, { session });
        // Clear the user's cart after successful checkout
        cart.items = [];
        yield cart.save({ session });
        // Commit the transaction
        yield session.commitTransaction();
    }
    catch (error) {
        // Abort the transaction in case of any error
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.checkoutService = checkoutService;
