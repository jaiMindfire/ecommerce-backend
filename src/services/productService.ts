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
  search?: string 
): Promise<{ products: IProduct[]; totalItems: number }> => {
  const skip = (page - 1) * limit;

  console.log(search,'ss')
  const pipeline = [
    {
      $match: search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
            ],
          }
        : {}, 
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
      $match: search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
            ],
          }
        : {},
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
