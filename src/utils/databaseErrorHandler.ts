import { MongoError } from "mongodb";
import mongoose from "mongoose";

export const handleDbError = (error: unknown) => {
  console.log(error, "databseerror");
  if (error instanceof mongoose.Error.ValidationError) {
    // Handle Mongoose validation errors
    throw new Error(
      "Validation failed: " +
        Object.values(error.errors)
          .map((e) => e.message)
          .join(", ")
    );
  }

  if (error instanceof MongoError && error.code === 11000) {
    // Handle duplicate key error
    throw new Error(
      "Duplicate key error: A record with this value already exists."
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    // Handle invalid ObjectId or type casting errors
    throw new Error("Invalid value for field ");
  }

  if (error instanceof mongoose.Error.DocumentNotFoundError) {
    // Handle document not found error
    throw new Error("Document not found.");
  }

  // Default fallback for any other errors
  throw new Error("Database operation failed: Something went wrong.");
};
