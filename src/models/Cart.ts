//3rd Party Imports
import mongoose, { Schema, Document } from "mongoose";
//Static Imports
import { IProduct } from "./Product";
import { IUser } from "./User";

interface ICartItem {
  product: IProduct["_id"];
  quantity: number;
}

export interface ICart extends Document {
  user: IUser["_id"];
  items: ICartItem[];
}

const CartItemSchema: Schema<ICartItem> = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId, //Ref to Product model
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: false }
);

const CartSchema: Schema<ICart> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, //Ref to user of the cart's owner
      ref: "User",
      required: true,
      unique: true,
    },
    items: [CartItemSchema], //Array of cart items.
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>("Cart", CartSchema);
