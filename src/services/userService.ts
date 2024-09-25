import { User, IUser } from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface RegisterInput {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (input: RegisterInput): Promise<IUser> => {
  const user = new User(input);
  return await user.save();
};

export const loginUser = async (input: LoginInput): Promise<string> => {
  const user = await User.findOne({ email: input.email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id).select("-password");
};

export const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find().select("-password");
};

export const updateUser = async (
  id: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteUser = async (id: string): Promise<IUser | null> => {
  return await User.findByIdAndDelete(id);
};
