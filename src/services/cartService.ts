import mongoose from "mongoose";
import { Cart, ICart } from "../models/Cart";
import { Product } from "../models/Product";
import { IUser } from "../models/User";

interface AddToCartInput {
  userId: string;
  productId: string;
  quantity: number;
}

interface UpdateCartInput {
  userId: string;
  productId: string;
  quantity: number;
}

export const getCartByUserId = async (
  userId: string
): Promise<ICart | null> => {
  return await Cart.findOne({ user: userId }).populate("items.product").lean();
};

export const addToCart = async (input: AddToCartInput): Promise<ICart> => {
  const { userId, productId, quantity } = input;

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");
  if (product.stock < quantity) throw new Error("Insufficient stock");

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{ product: productId, quantity }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item?.product.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      const productObjectId = new mongoose.Types.ObjectId(productId);
      cart.items.push({
        product: productObjectId,
        quantity,
      });
    }
  }

  await cart.save();
  return await cart.populate("items.product");
};

export const updateCartItem = async (
  input: UpdateCartInput
): Promise<ICart | null> => {
  const { userId, productId, quantity } = input;

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");
  if (product.stock < quantity) throw new Error("Insufficient stock");

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) throw new Error("Product not in cart");

  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  return await cart.populate("items.product");
};

export const removeCartItem = async (
  userId: string,
  productId: string
): Promise<ICart | null> => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  return await cart.populate("items.product");
};

export const clearCart = async (userId: string): Promise<void> => {
  await Cart.findOneAndDelete({ user: userId });
};
