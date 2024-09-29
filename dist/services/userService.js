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
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const registerUser = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield User_1.User.findOne({ email: input.email });
    if (existingUser) {
        throw new Error("User already exists with this email");
    }
    const user = new User_1.User(input);
    return yield user.save();
});
exports.registerUser = registerUser;
const loginUser = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findOne({ email: input.email });
    if (!user)
        throw new Error("Please sign up");
    const isMatch = yield user.comparePassword(input.password);
    if (!isMatch)
        throw new Error("Invalid credentials");
    const payload = { id: user._id, role: user.role };
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return { token, userName: user.email };
});
exports.loginUser = loginUser;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findById(id).select("-password");
});
exports.getUserById = getUserById;
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.find().select("-password");
});
exports.getAllUsers = getAllUsers;
const updateUser = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findByIdAndUpdate(id, updateData, { new: true });
});
exports.updateUser = updateUser;
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findByIdAndDelete(id);
});
exports.deleteUser = deleteUser;
