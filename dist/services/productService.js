"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
//Static Imports
const Product_1 = require("@models/Product");
const databaseErrorHandler_1 = require("@utils/databaseErrorHandler");
const redis_1 = require("src/config/redis");
// Retrieves all products with pagination, filtering, and sorting options
const getAllProducts = (page, limit, search, minPrice, maxPrice, minRating, categories) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const cacheKey = `products:page=${page}&limit=${limit}&search=${search}&minPrice=${minPrice}&maxPrice=${maxPrice}&minRating=${minRating}&categories=${categories === null || categories === void 0 ? void 0 : categories.join(',')}`;
        // Try to get cached data
        try {
            const cachedProducts = yield redis_1.redisClient.get(cacheKey);
        }
        catch (error) {
            console.log('redis error');
        }
        // if (cachedProducts) {
        //   return JSON.parse(cachedProducts); // Return cached products if found
        // }
        const skip = (page - 1) * limit;
        const match = {};
        if (search) {
            match.$or = [
                { name: { $regex: search, $options: "i" } }, // Search for name
                { description: { $regex: search, $options: "i" } }, //Search for description
            ];
        }
        if (minPrice || maxPrice) {
            match.price = {};
            if (minPrice)
                match.price.$gte = minPrice; // Greater than equal to minPrice
            if (maxPrice)
                match.price.$lte = maxPrice; // Less than equal to maxPrice
        }
        if (minRating) {
            match.rating = { $gte: minRating }; // Greater than and equal to minRating
        }
        if (categories && categories.length > 0) {
            match.category = { $in: categories }; // In the list of categories
        }
        const pipeline = [
            { $match: match },
            { $sort: { price: -1 } }, // Sort the list
            // Pagination
            { $skip: skip },
            { $limit: limit },
        ];
        const products = yield Product_1.Product.aggregate(pipeline).exec();
        const totalItemsPipeline = [{ $match: match }, { $count: "count" }];
        const totalItemsResult = yield Product_1.Product.aggregate(totalItemsPipeline).exec();
        const totalItems = ((_a = totalItemsResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
        // Cache the product list and total items for the given query
        try {
            yield redis_1.redisClient.set(cacheKey, JSON.stringify({ products, totalItems }), { EX: 3600 }); // Cache expires after 1 hour
        }
        catch (error) {
            console.log('redis error');
        }
        return { products, totalItems };
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        return { products: [], totalItems: 0 };
    }
});
exports.getAllProducts = getAllProducts;
// Retrieves a single product by its ID
const getProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = `product:${id}`; // Create a cache key for Redis
        // Try to get the product from Redis
        let cachedProduct;
        try {
            cachedProduct = yield redis_1.redisClient.get(cacheKey);
        }
        catch (_a) {
            console.log('redis error');
        }
        if (cachedProduct) {
            console.log('cahched prd');
            return JSON.parse(cachedProduct); // Return cached product if found
        }
        console.log('hererer');
        // If not found in cache, fetch from MongoDB
        const product = yield Product_1.Product.findById(id).lean(); // Use .lean() for faster queries without Mongoose documents
        if (product) {
            // Cache the product data in Redis, set expiration time (e.g., 1 hour)
            try {
                yield redis_1.redisClient.set(cacheKey, JSON.stringify(product), { EX: 3600 });
            }
            catch (_b) {
                console.log('redis error');
            }
        }
        return product;
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        return null;
    }
});
exports.getProductById = getProductById;
// Creates a new product in the database
const createProduct = (input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = new Product_1.Product(input); // Instantiate a new Product with the provided input
        return yield product.save(); // Save the new product to the database
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        throw error;
    }
});
exports.createProduct = createProduct;
// Updates an existing product by its ID
const updateProduct = (id, input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield Product_1.Product.findByIdAndUpdate(id, input, { new: true }).lean(); // Update and return the updated product
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        return null;
    }
});
exports.updateProduct = updateProduct;
// Deletes a product by its ID
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield Product_1.Product.findByIdAndDelete(id).lean(); // Delete the product and return it
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        return null;
    }
});
exports.deleteProduct = deleteProduct;
// Searches for products based on a text query
const searchProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield Product_1.Product.find({ $text: { $search: query } }).lean(); // Perform a text search and return results
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        return [];
    }
});
exports.searchProducts = searchProducts;
// Retrieves all distinct product categories
const getCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield Product_1.Product.distinct("category"); // Get distinct categories from the products
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        return [];
    }
});
exports.getCategories = getCategories;
