import mongoose from "mongoose";
import dotenv from "dotenv";
import { DATABASE_ERROR_MESSAGE, DATABASE_SUCCESS_MESSAGE } from "src/Contans";

dotenv.config(); // Load environment variables from .env file into process.env

const connectDB = async () => {
  try {
    //connect to the database using the connection URI from environment variables
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log(DATABASE_SUCCESS_MESSAGE);
  } catch (error) {
    console.error(`${DATABASE_ERROR_MESSAGE} ${error}`);
    process.exit(1); // Exit the process with an error code
  }
};

export default connectDB;
