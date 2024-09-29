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
exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const Product_1 = require("../models/Product");
const getAllProducts = (page, limit, search) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const skip = (page - 1) * limit;
    console.log(search, 'ss');
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
    const products = yield Product_1.Product.aggregate(pipeline).exec();
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
    const totalItemsResult = yield Product_1.Product.aggregate(totalItemsPipeline).exec();
    const totalItems = ((_a = totalItemsResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
    return {
        products,
        totalItems,
    };
});
exports.getAllProducts = getAllProducts;
const getProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Product_1.Product.findById(id).lean();
});
exports.getProductById = getProductById;
const createProduct = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const product = new Product_1.Product(input);
    return yield product.save();
});
exports.createProduct = createProduct;
const updateProduct = (id, input) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Product_1.Product.findByIdAndUpdate(id, input, { new: true });
});
exports.updateProduct = updateProduct;
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Product_1.Product.findByIdAndDelete(id);
});
exports.deleteProduct = deleteProduct;
const searchProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Product_1.Product.find({ $text: { $search: query } }).lean();
});
exports.searchProducts = searchProducts;
