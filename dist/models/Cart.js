"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
//3rd Party Imports
const mongoose_1 = __importDefault(require("mongoose"));
const CartItemSchema = new mongoose_1.default.Schema({
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId, //Ref to Product model
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
    },
}, { _id: false });
const CartSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId, //Ref to user of the cart's owner
        ref: "User",
        required: true,
        unique: true,
    },
    items: [CartItemSchema], //Array of cart items.
}, { timestamps: true });
exports.Cart = mongoose_1.default.model("Cart", CartSchema);
