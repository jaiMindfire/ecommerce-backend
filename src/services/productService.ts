//3rd Party Imports
import mongoose, { PipelineStage } from "mongoose";
//Static Imports
import { Product, IProduct } from "@models/Product";
import { handleDbError } from "@utils/databaseErrorHandler";

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}

interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  stock?: number;
}

// Retrieves all products with pagination, filtering, and sorting options
export const getAllProducts = async (
  page: number,
  limit: number,
  search?: string,
  minPrice?: number,
  maxPrice?: number,
  minRating?: number,
  categories?: string[]
): Promise<{ products: IProduct[]; totalItems: number }> => {
  try {
    const skip = (page - 1) * limit; // Calculate the number of documents to skip for pagination
    const match: any = {}; // Object to build query conditions

    // Add search criteria if provided
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add price range filtering if provided
    if (minPrice || maxPrice) {
      match.price = {};
      if (minPrice) match.price.$gte = minPrice; // Greater than or equal to minPrice
      if (maxPrice) match.price.$lte = maxPrice; // Less than or equal to maxPrice
    }

    // Add minimum rating filtering if provided
    if (minRating) {
      match.rating = { $gte: minRating }; // Greater than or equal to minRating
    }

    // Add category filtering if provided
    if (categories && categories.length > 0) {
      match.category = { $in: categories }; // Match any of the provided categories
    }

    // MongoDB aggregation pipeline to get filtered, sorted, and paginated products
    const pipeline: PipelineStage[] = [
      { $match: match }, // Match products based on the constructed query
      { $sort: { price: -1 } }, // Sort by price in descending order
      { $skip: skip }, // Skip the calculated number of documents for pagination
      { $limit: limit }, // Limit the number of documents returned
    ];

    // Execute the aggregation pipeline
    const products = await Product.aggregate(pipeline).exec();

    // Pipeline to count total matching items for pagination
    const totalItemsPipeline = [{ $match: match }, { $count: "count" }];
    const totalItemsResult = await Product.aggregate(totalItemsPipeline).exec();
    const totalItems = totalItemsResult[0]?.count || 0; // Get the total count

    return { products, totalItems }; // Return the products and total count
  } catch (error) {
    handleDbError(error); // Handle any database errors
    return { products: [], totalItems: 0 }; // Return empty results on error
  }
};

// Retrieves a single product by its ID
export const getProductById = async (id: string): Promise<IProduct | null> => {
  try {
    return await Product.findById(id).lean(); // Use .lean() for faster queries without Mongoose documents
  } catch (error) {
    handleDbError(error);
    return null;
  }
};

// Creates a new product in the database
export const createProduct = async (
  input: CreateProductInput
): Promise<IProduct> => {
  try {
    const product = new Product(input); // Instantiate a new Product with the provided input
    return await product.save(); // Save the new product to the database
  } catch (error) {
    handleDbError(error); 
    throw error; 
  }
};

// Updates an existing product by its ID
export const updateProduct = async (
  id: string,
  input: UpdateProductInput
): Promise<IProduct | null> => {
  try {
    return await Product.findByIdAndUpdate(id, input, { new: true }).lean(); // Update and return the updated product
  } catch (error) {
    handleDbError(error); 
    return null; 
  }
};

// Deletes a product by its ID
export const deleteProduct = async (id: string): Promise<IProduct | null> => {
  try {
    return await Product.findByIdAndDelete(id).lean(); // Delete the product and return it
  } catch (error) {
    handleDbError(error); 
    return null; 
  }
};

// Searches for products based on a text query
export const searchProducts = async (query: string): Promise<IProduct[]> => {
  try {
    return await Product.find({ $text: { $search: query } }).lean(); // Perform a text search and return results
  } catch (error) {
    handleDbError(error); 
    return []; 
  }
};

// Retrieves all distinct product categories
export const getCategories = async () => {
  try {
    return await Product.distinct("category"); // Get distinct categories from the products
  } catch (error) {
    handleDbError(error); 
    return [];
  }
};
