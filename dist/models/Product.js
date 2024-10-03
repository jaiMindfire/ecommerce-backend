"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ProductSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        index: true,
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Price cannot be negative"],
    },
    imageUrl: {
        type: String,
        required: [true, "Product image URL is required"],
        trim: true,
    },
    stock: {
        type: Number,
        required: [true, "Product stock is required"],
        min: [0, "Stock cannot be negative"],
    },
    category: {
        type: String,
        trim: true,
        required: [true, "Product category is required"],
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });
ProductSchema.index({ name: "text", description: "text" });
exports.Product = mongoose_1.default.model("Product", ProductSchema);
