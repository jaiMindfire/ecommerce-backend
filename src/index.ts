// 3rd party imports
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
// Static Imports
import connectDB from "./config/database";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { swaggerSetup } from "./swagger";
import connectRedis from "./config/redis";

dotenv.config();

const app = express();

// Initialize Database and Redis connections
connectDB();
connectRedis();

// Rate limiting middleware
/**
 * Apply rate limiting to all requests to prevent abuse. This middleware limits each IP
 * to a maximum of 100 requests per 15-minute window. If the limit is exceeded, the user
 * will receive a 429 status with a message asking them to try again later.
 * This helps mitigate brute-force attacks, DDOS, or scraping attempts.
 */
const limiter = rateLimit({
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
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Only allow resources from the same origin
      scriptSrc: ["'self'"  ], // Allow inline scripts and specific CDN
      // styleSrc: ["'self'", "'unsafe-inline'", "https://trusted.cdn.com"], // Allow inline styles and specific CDN
      // imgSrc: ["'self'", "data:", "https://images.trusted.com"], // Allow self-hosted images and data URIs
      // connectSrc: ["'self'", "https://api.trusted.com"], // Restrict API connections to self or trusted API
      // fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow fonts from specific trusted sources
      objectSrc: ["'none'"], // Disallow object embeds (e.g., Flash, Silverlight)
      frameSrc: ["'none'"], // Disallow frames or iframes from any source
      upgradeInsecureRequests: [], // Automatically upgrade HTTP to HTTPS
    },
  })
);

// Enable CORS for cross-origin resource sharing
app.use(cors());
// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// HTTP request logger
app.use(morgan("dev"));

// Define application routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Custom error handling middleware
app.use(errorHandler);

// Setup API documentation with Swagger
swaggerSetup(app);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
