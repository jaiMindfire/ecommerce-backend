"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
// 3rd party imports
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Static Imports
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const swagger_1 = require("./swagger");
const redis_1 = require("./config/redis");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
// Initialize Database and Redis connections
(0, database_1.connectDB)();
(0, redis_1.connectRedis)();
// Rate limiting middleware
/**
 * Apply rate limiting to all requests to prevent abuse. This middleware limits each IP
 * to a maximum of 100 requests per 15-minute window. If the limit is exceeded, the user
 * will receive a 429 status with a message asking them to try again later.
 * This helps mitigate brute-force attacks, DDOS, or scraping attempts.
 */
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests from this IP, please try again later.",
});
// Apply rate limiting globally
app.use(limiter);
// Content Security Policy (CSP) via Helmet
/**
 * Content Security Policy (CSP) helps prevent cross-site scripting (XSS),
 * clickjacking, and other code injection attacks by specifying what content
 * is allowed to be loaded in your application.
 */
app.use(helmet_1.default.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"], // Only allow resources from the same origin
        scriptSrc: ["'self'"], // Allow inline scripts and specific CDN
        // styleSrc: ["'self'", "'unsafe-inline'", "https://trusted.cdn.com"], // Allow inline styles and specific CDN
        // imgSrc: ["'self'", "data:", "https://images.trusted.com"], // Allow self-hosted images and data URIs
        // connectSrc: ["'self'", "https://api.trusted.com"], // Restrict API connections to self or trusted API
        // fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow fonts from specific trusted sources
        objectSrc: ["'none'"], // Disallow object embeds (e.g., Flash, Silverlight)
        frameSrc: ["'none'"], // Disallow frames or iframes from any source
        upgradeInsecureRequests: [], // Automatically upgrade HTTP to HTTPS
    },
}));
// Enable CORS for cross-origin resource sharing
app.use((0, cors_1.default)());
// Body parsing middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// HTTP request logger
app.use((0, morgan_1.default)("dev"));
// Define application routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/cart", cartRoutes_1.default);
// Custom error handling middleware
app.use(errorHandler_1.errorHandler);
// Setup API documentation with Swagger
(0, swagger_1.swaggerSetup)(app);
// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.server = server;
