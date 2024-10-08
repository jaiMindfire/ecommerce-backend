import { Request, Response, NextFunction } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getCategories,
} from "../services/productService";
import { validationResult } from "express-validator";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const priceRange = (req.query.priceRange as string) || "";
    const [minPrice, maxPrice] = priceRange.split(",").map(Number);
    console.log(typeof req.query.categories, "ddd");
    const categories = req.query.categories
      ? (req.query.categories as string)?.split(",")
      : [];
    console.log(categories, "dcdc");
    const minRating = parseInt(req.query.rating as string) || 0;

    const { products, totalItems } = await getAllProducts(
      page,
      limit,
      search,
      minPrice,
      maxPrice,
      minRating,
      categories
    );

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createNewProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await createProduct(req.body);
    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await deleteProduct(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const searchProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await searchProducts(query);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getCategories();
    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};
