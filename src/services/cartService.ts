import mongoose from "mongoose";
import { Cart, ICart } from "../models/Cart";
import { Product } from "../models/Product";
import { IUser } from "../models/User";
import { CreateProductInput } from "./productService";

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

interface CartItem {
  product: any;
  quantity: number;
}

export const getCartByUserId = async (
  userId: string
): Promise<ICart | null> => {
  const id = new mongoose.Types.ObjectId(userId);
  return await Cart.findOne({ user: id }).populate("items.product").lean();
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

export const massAddItemsToCart = async (userId: string, items: CartItem[]) => {
  let cart = await Cart.findOne({ user: userId });
  console.log(userId, 'user')
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }
  const existingProductIds = cart.items.map(item => item.product.toString());
  const newItems = items.filter(
    (item) => !existingProductIds.includes(item.product._id)
  );

  if(newItems.length){
    items.map((item) => {
      cart.items.push({
        product: item.product._id,
        quantity: item.quantity,
      });
    });
  }


  await cart.save();

  return cart;
};

export const checkoutService = async (userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const cart = await Cart.findOne({ user: userId }).session(session);

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const productIds = cart.items.map((item) => item.product);

    const products = await Product.find({ _id: { $in: productIds } }).session(session);

    const bulkOperations = [];

    // Validate stock and build bulk operations to decrease stock
    for (const cartItem of cart.items) {
      const product = products.find((p) => p._id.toString() === cartItem.product.toString());

      if (!product) {
        await session.abortTransaction();
        throw new Error(`Product with ID ${cartItem.product} not found`);
      }

      if (product.stock < cartItem.quantity) {
        await session.abortTransaction();
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
    await Product.bulkWrite(bulkOperations, { session });

    // Clear the user's cart after successful checkout
    cart.items = [];
    await cart.save({ session });

    // Commit the transaction
    await session.commitTransaction();
  } catch (error) {
    // Abort the transaction in case of any error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

