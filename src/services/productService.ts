import { Product, IProduct } from "../models/Product";

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

export const getAllProducts = async (
  page: number,
  limit: number,
  search?: string,
  minPrice?: number,
  maxPrice?: number,
  minRating?: number,
  categories?: string[],
): Promise<{ products: IProduct[]; totalItems: number }> => {
  console.log(minPrice, maxPrice, minRating, categories)
  const skip = (page - 1) * limit;

  const match: any = {};

  if (search) {
    match.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (minPrice || maxPrice) {
    match.price = {};
    if (minPrice) {
      match.price.$gte = minPrice;
    }
    if (maxPrice) {
      match.price.$lte = maxPrice;
    }
  }

  if (minRating) {
    match.rating = { $gte: minRating };
  }

  if (categories && categories.length > 0) {
    match.category = { $in: categories }; 
  }

  const pipeline = [
    {
      $match: match,
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];

  const products = await Product.aggregate(pipeline).exec();

  const totalItemsPipeline = [
    {
      $match: match,
    },
    {
      $count: "count",
    },
  ];

  const totalItemsResult = await Product.aggregate(totalItemsPipeline).exec();
  const totalItems = totalItemsResult[0]?.count || 0;

  return {
    products,
    totalItems,
  };
};



export const getProductById = async (id: string): Promise<IProduct | null> => {
  return await Product.findById(id).lean();
};

export const createProduct = async (
  input: CreateProductInput
): Promise<IProduct> => {
  const product = new Product(input);
  return await product.save();
};

export const updateProduct = async (
  id: string,
  input: UpdateProductInput
): Promise<IProduct | null> => {
  return await Product.findByIdAndUpdate(id, input, { new: true });
};

export const deleteProduct = async (id: string): Promise<IProduct | null> => {
  return await Product.findByIdAndDelete(id);
};

export const searchProducts = async (query: string): Promise<IProduct[]> => {
  return await Product.find({ $text: { $search: query } }).lean();
};

export const getCategories = async () => {
  return await Product.distinct('category');
}
