"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const Contants_1 = require("src/Contants");
dotenv_1.default.config();
// Middleware function to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization; // Get the Authorization header
    // Check if the Authorization header is present and starts with "Bearer " and responsd with 401 if missing
    if (!authHeader || !authHeader.startsWith("Bearer "))
        return res.status(401).json({ message: Contants_1.AUTH_MESSAGES.authTokenMissing });
    const token = authHeader.split(" ")[1];
    try {
        // Verify the token using the secret and decode it
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userData = decoded; // Attach decoded user data to the request object, and this userData will be available for further middleware.
        next();
    }
    catch (error) {
        res.status(401).json({ message: Contants_1.AUTH_MESSAGES.invalidOrExpiredToken });
    }
};
exports.authenticateJWT = authenticateJWT;
