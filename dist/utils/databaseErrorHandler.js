"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDbError = void 0;
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const handleDbError = (error) => {
    console.log(error, "databseerror");
    if (error instanceof mongoose_1.default.Error.ValidationError) {
        // Handle Mongoose validation errors
        throw new Error("Validation failed: " +
            Object.values(error.errors)
                .map((e) => e.message)
                .join(", "));
    }
    if (error instanceof mongodb_1.MongoError && error.code === 11000) {
        // Handle duplicate key error
        throw new Error("Duplicate key error: A record with this value already exists.");
    }
    if (error instanceof mongoose_1.default.Error.CastError) {
        // Handle invalid ObjectId or type casting errors
        throw new Error("Invalid value for field ");
    }
    if (error instanceof mongoose_1.default.Error.DocumentNotFoundError) {
        // Handle document not found error
        throw new Error("Document not found.");
    }
    // Default fallback for any other errors
    throw new Error("Database operation failed: Something went wrong.");
};
exports.handleDbError = handleDbError;
