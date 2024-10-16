// 3rd Party Imports
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

// Static Imports
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getCategories,
} from "@services/productService";

// Get the products list according to pagination, search, and filters.
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1; // Current page number
    const limit = parseInt(req.query.limit as string) || 10; // Number of items per page
    const search = (req.query.search as string) || ""; // Search term

    // Parse price range from query
    const priceRange = (req.query.priceRange as string) || "";
    const [minPrice, maxPrice] = priceRange.split(",").map(Number);

    // Parse categories from query
    const categories = req.query.categories
      ? (req.query.categories as string)?.split(",")
      : [];

    const minRating = parseInt(req.query.rating as string) || 0; // Minimum rating

    // Fetch products based on the filters
    const { products, totalItems } = await getAllProducts(
      page,
      limit,
      search,
      minPrice,
      maxPrice,
      minRating,
      categories
    );

    // Respond with products and pagination info
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
    next(error); // Handle errors, this will send erorrs to error handling middleware.
  }
};

// Get a single product by ID
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await getProductById(req.params.id); // Fetch product by ID
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product); // Respond with product data
  } catch (error) {
    next(error); // Handle errors
  }
};

// Create a new product
export const createNewProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req); // Validate request data
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // Return validation errors
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

// Update an existing product
export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await updateProduct(req.params.id, req.body); // Update the product
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error); 
  }
};

// Delete a product
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

// Search for products -> Old version, now we are seraching in getProducts controller itself.
export const searchProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string; // Get search query
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await searchProducts(query);
    res.json(products);
  } catch (error) {
    next(error); 
  }
};

// Get all product categories -> to be used for filtering in frontend.
export const getCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getCategories(); // Fetch categories
    return res.status(200).json(categories); 
  } catch (error) {
    next(error); 
  }
};
