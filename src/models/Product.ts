import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  rating: number;
}

const ProductSchema: Schema<IProduct> = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text" }); // Create a text index on the 'name' and 'description' fields for full-text search capabilities

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
