import jwt from "jsonwebtoken";
import dotenv from "dotenv";
//Static Imports
import { User, IUser } from "@models/User";
import { handleDbError } from "@utils/databaseErrorHandler";

dotenv.config();


interface RegisterInput {
  username: string; 
  email: string;    
  password: string; 
  role?: "admin" | "user"; // Optional role for the user
}


interface LoginInput {
  email: string;    
  password: string; 
}

// Function to register a new user
export const registerUser = async (input: RegisterInput): Promise<IUser> => {
  try {
    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Create a new user instance and save it to the database
    const user = new User(input);
    return await user.save(); // Return the saved user
  } catch (error) {
    handleDbError(error); 
    throw error; 
  }
};

// Function to log in a user
export const loginUser = async (
  input: LoginInput
): Promise<{ token: string; userName: string }> => {
  try {
    // Find the user by email
    const user = await User.findOne({ email: input.email });
    if (!user) throw new Error("Please sign up"); // Throw error if user not found

    // Check if the provided password matches the stored password
    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) throw new Error("Invalid credentials"); // Throw error if passwords don't match

    // Create a payload for the JWT
    const payload = { id: user._id, role: user.role };
    // Sign the token with the secret and set expiration
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return { token, userName: user.email }; 
  } catch (error) {
    handleDbError(error); 
    throw error; 
  }
};

// Function to get a user by their ID
export const getUserById = async (id: string): Promise<IUser | null> => {
  try {
    // Find the user by ID and exclude the password field from the result
    return await User.findById(id).select("-password");
  } catch (error) {
    handleDbError(error); 
    return null; 
  }
};

// Function to get all users
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    // Retrieve all users and exclude the password field from the results
    return await User.find().select("-password");
  } catch (error) {
    handleDbError(error); 
    return []; // Return an empty array on error
  }
};

// Function to update a user's information
export const updateUser = async (
  id: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  try {
    // Find the user by ID and update their information, returning the updated user
    return await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
  } catch (error) {
    handleDbError(error); 
    return null; 
  }
};

// Function to delete a user by their ID
export const deleteUser = async (id: string): Promise<IUser | null> => {
  try {
    // Find the user by ID and delete them from the database
    return await User.findByIdAndDelete(id).lean();
  } catch (error) {
    handleDbError(error); 
    return null; 
  }
};
