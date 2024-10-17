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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getAllUsers = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
//Static Imports
const User_1 = require("@models/User");
const databaseErrorHandler_1 = require("@utils/databaseErrorHandler");
const customError_1 = require("@utils/customError");
dotenv_1.default.config();
// Function to register a new user
const registerUser = (input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if a user with the provided email already exists
        const existingUser = yield User_1.User.findOne({ email: input.email });
        if (existingUser) {
            throw new customError_1.CustomError("User already exists with this email");
        }
        // Create a new user instance and save it to the database
        const user = new User_1.User(input);
        return yield user.save(); // Return the saved user
    }
    catch (error) {
        if (error instanceof customError_1.CustomError) {
            throw error;
        }
        (0, databaseErrorHandler_1.handleDbError)(error);
        throw error;
    }
});
exports.registerUser = registerUser;
// Function to log in a user
const loginUser = (input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by email
        const user = yield User_1.User.findOne({ email: input.email });
        if (!user)
            throw new customError_1.CustomError("Please sign up", 404); // Throw error if user not found
        // Check if the provided password matches the stored password
        const isMatch = yield user.comparePassword(input.password);
        if (!isMatch)
            throw new customError_1.CustomError("Invalid credentials", 401); // Throw error if passwords don't match
        // Create a payload for the JWT
        const payload = { id: user._id, role: user.role };
        // Sign the token with the secret and set expiration
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        return { token, userName: user.email };
    }
    catch (error) {
        if (error instanceof customError_1.CustomError) {
            throw error;
        }
        (0, databaseErrorHandler_1.handleDbError)(error);
        throw error;
    }
});
exports.loginUser = loginUser;
// Function to get a user by their ID
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by ID and exclude the password field from the result
        return yield User_1.User.findById(id).select("-password");
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        return null;
    }
});
exports.getUserById = getUserById;
// Function to get all users
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve all users and exclude the password field from the results
        return yield User_1.User.find().select("-password");
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        return []; // Return an empty array on error
    }
});
exports.getAllUsers = getAllUsers;
// Function to update a user's information
const updateUser = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by ID and update their information, returning the updated user
        return yield User_1.User.findByIdAndUpdate(id, updateData, { new: true }).lean();
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        return null;
    }
});
exports.updateUser = updateUser;
// Function to delete a user by their ID
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by ID and delete them from the database
        return yield User_1.User.findByIdAndDelete(id).lean();
    }
    catch (error) {
        (0, databaseErrorHandler_1.handleDbError)(error);
        return null;
    }
});
exports.deleteUser = deleteUser;
