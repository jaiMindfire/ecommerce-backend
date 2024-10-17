//3rd Party Imports
import mongoose, { PipelineStage } from "mongoose";
//Static Imports
import { Product, IProduct } from "@models/Product";
import { handleDbError } from "@utils/databaseErrorHandler";
import { redisClient } from "src/config/redis";

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
    const cacheKey = `products:page=${page}&limit=${limit}&search=${search}&minPrice=${minPrice}&maxPrice=${maxPrice}&minRating=${minRating}&categories=${categories?.join(',')}`;
    
    // Try to get cached data
    const cachedProducts = await redisClient.get(cacheKey);
    
    if (cachedProducts) {
      return JSON.parse(cachedProducts); // Return cached products if found
    }

    const skip = (page - 1) * limit;
    const match: any = {};

    if (search) {
      match.$or = [
        { name: { $regex: search, $options: "i" } },  // Search for name
        { description: { $regex: search, $options: "i" } }, //Search for description
      ];
    }
    if (minPrice || maxPrice) {
      match.price = {};
      if (minPrice) match.price.$gte = minPrice; // Greater than equal to minPrice
      if (maxPrice) match.price.$lte = maxPrice; // Less than equal to maxPrice
    }
    if (minRating) {
      match.rating = { $gte: minRating };// Greater than and equal to minRating
    }
    if (categories && categories.length > 0) {
      match.category = { $in: categories }; // In the list of categories
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { price: -1 } }, // Sort the list
      // Pagination
      { $skip: skip }, 
      { $limit: limit },
    ];

    const products = await Product.aggregate(pipeline).exec();
    const totalItemsPipeline = [{ $match: match }, { $count: "count" }];
    const totalItemsResult = await Product.aggregate(totalItemsPipeline).exec();
    const totalItems = totalItemsResult[0]?.count || 0;

    // Cache the product list and total items for the given query
    await redisClient.set(cacheKey, JSON.stringify({ products, totalItems }), { EX: 3600 }); // Cache expires after 1 hour

    return { products, totalItems };
  } catch (error) {
    handleDbError(error);
    return { products: [], totalItems: 0 };
  }
};


// Retrieves a single product by its ID
export const getProductById = async (id: string): Promise<IProduct | null> => {
  try {
    const cacheKey = `product:${id}`; // Create a cache key for Redis

    // Try to get the product from Redis
    const cachedProduct = await redisClient.get(cacheKey);
    
    if (cachedProduct) {
      console.log('cahched prd')
      return JSON.parse(cachedProduct); // Return cached product if found
    }
    console.log('hererer')
    // If not found in cache, fetch from MongoDB
    const product = await Product.findById(id).lean(); // Use .lean() for faster queries without Mongoose documents
    
    if (product) {
      // Cache the product data in Redis, set expiration time (e.g., 1 hour)
      await redisClient.set(cacheKey, JSON.stringify(product), { EX: 3600 });
    }

    return product;
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
