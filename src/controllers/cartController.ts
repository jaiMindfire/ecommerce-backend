import { Request, Response, NextFunction } from "express";
import {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  massAddItemsToCart,
  checkoutService,
} from "../services/cartService";
import { validationResult } from "express-validator";

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cart = await getCartByUserId(req.userData.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

export const addItemToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;
    const cart = await addToCart({
      userId: req.userData.id,
      productId,
      quantity,
    });
    res.status(200).json({
      message: "Item added to cart",
      cart,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

export const removeItemFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const cart = await removeCartItem(req.userData.id, productId);

    res.json({
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

export const checkoutCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await checkoutService(req.userData.id);
    res.status(200).json({ message: "Checkout completed successfully" });
  } catch (error) {
    next(error);
  }
};

export const massAddToCart = async (req: Request, res: Response) => {
  const { items } = req.body;
  const userId = req.userData.id;

  try {
    const updatedCart = await massAddItemsToCart(userId, items);
    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: updatedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the cart",
    });
  }
};
