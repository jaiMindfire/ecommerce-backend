//3rd Party Imports
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file into process.env

//function to connect to the MongoDB database
const connectDB = async () => {
  try {
    //connect to the database using the connection URI from environment variables
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected Successfully"); 
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1); // Exit the process with an error code
  }
};

export default connectDB;
