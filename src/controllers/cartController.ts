// 3rd Party Imports
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
// Static Imports
import {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  massAddItemsToCart,
  checkoutService,
} from "@services/cartService";
import { CART_MESSAGES } from "src/Contants";

//get the current authenticated user's cart items
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cart = await getCartByUserId(req.userData.id);
    if (!cart) return res.status(404).json({ message: CART_MESSAGES.cartNotFound });
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// Add an item to the cart
export const addItemToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are errors, return a 400 status with the errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;
    const cart = await addToCart({
      userId: req.userData.id,
      productId,
      quantity,
    });
    res.status(200).json({
      message: CART_MESSAGES.itemAdded,
      cart,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Update an item in the cart
export const updateCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;
    const cart = await updateCartItem({
      userId: req.userData.id,
      productId,
      quantity,
    });

    res.json({
      message: CART_MESSAGES.cartUpdated,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// Remove an item from the cart
export const removeItemFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const cart = await removeCartItem(req.userData.id, productId);

    res.json({
      message: CART_MESSAGES.itemRemoved,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// Controller for doing checkout flow
export const checkoutCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await checkoutService(req.userData.id);
    res.status(200).json({ message: CART_MESSAGES.checkoutSuccess });
  } catch (error) {
    next(error);
  }
};

//Add items to cart in bulk
export const massAddToCart = async (req: Request, res: Response) => {
  const { items } = req.body;
  const userId = req.userData.id;

  try {
    const updatedCart = await massAddItemsToCart(userId, items);
    res.status(200).json({
      success: true,
      message: CART_MESSAGES.cartUpdatedBulk,
      data: updatedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: CART_MESSAGES.cartUpdateError,
    });
  }
};
