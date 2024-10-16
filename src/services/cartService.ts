//3rd Party Imports
import mongoose from "mongoose";
//Static Imports
import { Cart, ICart } from "@models/Cart";
import { Product } from "@models/Product";
import { handleDbError } from "@utils/databaseErrorHandler";

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
    // Uses Mongoose to find the cart, populating the product details in the items.
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
    if (!product) throw new Error("Product not found");
    if (product.stock < quantity) throw new Error("Insufficient stock");

    let cart = await Cart.findOne({ user: userId });
    // If no cart exists for the user, create a new one.
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item?.product.toString() === productId
      );
      // If the item already exists, update its quantity.
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        // If the item does not exist, add it to the cart.
        const productObjectId = new mongoose.Types.ObjectId(productId);
        cart.items.push({
          product: productObjectId,
          quantity,
        });
      }
    }

    // Save the cart after modifications and populate product details.
    await cart.save();
    return await cart.populate("items.product");
  } catch (error) {
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
    if (!product) throw new Error("Product not found");
    if (product.stock < quantity) throw new Error("Insufficient stock");

    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Cart not found");

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) throw new Error("Product not in cart");

    // Remove the item if quantity is zero, otherwise update its quantity.
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return await cart.populate("items.product");
  } catch (error) {
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
    if (!cart) throw new Error("Cart not found");

    // Filters out the item to be removed.
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    return await cart.populate("items.product");
  } catch (error) {
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
      // Creates a new cart if none exists.
      cart = new Cart({ user: userId, items: [] });
    }
    const existingProductIds = cart.items.map((item) =>
      item.product.toString()
    );
    // Filters out items that are already in the cart.
    const newItems = items.filter(
      (item) => !existingProductIds.includes(item.product._id)
    );

    if (newItems.length) {
      newItems.forEach((item) => {
        cart.items.push({
          product: item.product._id,
          quantity: item.quantity,
        });
      });
    }

    await cart.save();
    return cart;
  } catch (error) {
    handleDbError(error);
  }
};

/**
 * Processes the checkout by reducing product stock according to cart items,
 * and clears the cart after successful checkout.
 * Uses a transaction to ensure data integrity.
 */
export const checkoutService = async (userId: string): Promise<void> => {
  // Start a new MongoDB session for transaction management
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Retrieve the user's cart within the transaction session
    const cart = await Cart.findOne({ user: userId }).session(session);

    // Check if the cart exists and contains items
    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty"); 
    }

    // Extract product IDs from the cart items for stock checking
    const productIds = cart.items.map((item) => item.product);
    // Fetch the products from the database to check their stock levels
    const products = await Product.find({ _id: { $in: productIds } }).session(
      session
    );

    // Prepare an array to hold bulk update operations for product stock
    const bulkOperations = [];

    // Iterate through each item in the cart to validate stock and prepare updates
    for (const cartItem of cart.items) {
      // Find the corresponding product in the fetched products
      const product = products.find(
        (p) => p._id.toString() === cartItem.product.toString()
      );

      // If the product is not found, abort the transaction and throw an error
      if (!product) {
        await session.abortTransaction();
        throw new Error(`Product with ID ${cartItem.product} not found`);
      }

      // Check if there is sufficient stock for the item being purchased
      if (product.stock < cartItem.quantity) {
        await session.abortTransaction();
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      // Prepare a bulk operation to decrement the product stock
      bulkOperations.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { stock: -cartItem.quantity } },
        },
      });
    }

    // Execute all stock updates in a single operation for efficiency
    await Product.bulkWrite(bulkOperations, { session });
    // Clear the cart items after successful checkout
    cart.items = [];
    // Save the updated cart state within the transaction session
    await cart.save({ session });
    // Commit the transaction to apply all changes
    await session.commitTransaction();
  } catch (error) {
    // Roll back the transaction on error
    await session.abortTransaction();
    handleDbError(error);
  } finally {
    // End the session regardless of the transaction outcome
    session.endSession();
  }
};
