// 3rd Party Imports
import mongoose from "mongoose";
import { Worker } from "worker_threads";
// Static Imports
import { Cart, ICart } from "@models/Cart";
import { Product } from "@models/Product";
import { handleDbError } from "@utils/databaseErrorHandler";
import { CustomError } from "@utils/customError";
import { redisClient } from "src/config/redis";

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

//Retrieves the shopping cart for a specific user by their user ID.
export const getCartByUserId = async (
  userId: string
): Promise<ICart | null> => {
  try {
    const id = new mongoose.Types.ObjectId(userId);
    return await Cart.findOne({ user: id }).populate("items.product").lean();
  } catch (error) {
    handleDbError(error);
    return null; // Ensures a null return on error.
  }
};

//Adds an item to the user's cart or updates the quantity if it already exists.
export const addToCart = async (
  input: AddToCartInput
): Promise<ICart | null> => {
  const { userId, productId, quantity } = input;

  try {
    const product = await Product.findById(productId);
    if (!product) throw new CustomError("Product not found", 404);
    if (product.stock < quantity)
      throw new CustomError("Insufficient stock", 400);

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
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    handleDbError(error);
    return null;
  }
};

//Updates the quantity of a specific item in the user's cart.
export const updateCartItem = async (
  input: UpdateCartInput
): Promise<ICart | null> => {
  const { userId, productId, quantity } = input;

  try {
    const product = await Product.findById(productId);
    if (!product) throw new CustomError("Product not found", 404);
    if (product.stock < quantity)
      throw new CustomError("Insufficient stock", 400);

    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new CustomError("Cart not found", 404);

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) throw new CustomError("Product not in cart", 404);

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return await cart.populate("items.product");
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    handleDbError(error);
    return null;
  }
};

//Removes a specific item from the user's cart based on product ID.
export const removeCartItem = async (
  userId: string,
  productId: string
): Promise<ICart | null> => {
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new CustomError("Cart not found", 404);

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    return await cart.populate("items.product");
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    handleDbError(error);
    return null;
  }
};

//Clears the entire cart for a specific user by deleting it from the database.
export const clearCart = async (userId: string): Promise<void> => {
  try {
    await Cart.findOneAndDelete({ user: userId });
  } catch (error) {
    handleDbError(error);
  }
};

//Adds multiple items to the user's cart, ensuring no duplicates are added.
export const massAddItemsToCart = async (userId: string, items: CartItem[]) => {
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    const existingProductIds = cart.items.map((item) =>
      item.product.toString()
    );

    // Offload filtering to a worker thread
    const worker = new Worker("./src/utils/cartWorker.ts");
    const workerPayload = { existingProductIds, newItems: items };

    const filteredItems: any = await new Promise((resolve, reject) => {
      worker.postMessage({ type: "filterItems", payload: workerPayload });
      worker.on("message", (message) => {
        if (message.type === "filteredItems") {
          resolve(message.payload);
        }
      });
      worker.on("error", reject);
    });

    // Push filtered items into the cart
    filteredItems.forEach((item: any) => {
      cart.items.push({
        product: item.product._id,
        quantity: item.quantity,
      });
    });

    await cart.save();
    return cart;
  } catch (error) {
    handleDbError(error);
  }
};

// Processes the checkout by reducing product stock according to cart items, and clears the cart after successful checkout.
//Uses a transaction to ensure data integrity.
export const checkoutService = async (userId: string): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: userId }).session(session);

    if (!cart || cart.items.length === 0) {
      throw new CustomError("Cart is empty", 400);
    }

    const productIds = cart.items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).session(
      session
    );

    const bulkOperations = [];

    for (const cartItem of cart.items) {
      const product = products.find(
        (p) => p._id.toString() === cartItem.product.toString()
      );

      if (!product) {
        await session.abortTransaction();
        throw new CustomError(
          `Product with ID ${cartItem.product} not found`,
          404
        );
      }

      if (product.stock < cartItem.quantity) {
        await session.abortTransaction();
        throw new CustomError(
          `Insufficient stock for product: ${product.name}`,
          400
        );
      }
      const cacheKey = `product:${product._id}`;
      try{
        await redisClient.del(cacheKey);
      }
      catch{
        console.log('redis error')
      }
      bulkOperations.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { stock: -cartItem.quantity } },
        },
      });
    }

    await Product.bulkWrite(bulkOperations, { session });
    cart.items = [];
    await cart.save({ session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof CustomError) {
      throw error;
    }
    handleDbError(error);
  } finally {
    session.endSession();
  }
};
