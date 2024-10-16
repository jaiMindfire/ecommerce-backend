// 3rd Party Imports
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AUTH_MESSAGES } from "src/Contants";

dotenv.config();

// structure of the JWT payload
interface JwtPayload {
  id: string;
  role: "admin" | "user";
  iat: number; // Issued at time
  exp: number; // Expiration time
}

// Extend the Express Request interface to include userData
declare global {
  namespace Express {
    interface Request {
      userData: JwtPayload; // Custom property to hold decoded user data
    }
  }
}

// Middleware function to authenticate JWT
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization; // Get the Authorization header

  // Check if the Authorization header is present and starts with "Bearer " and responsd with 401 if missing
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: AUTH_MESSAGES.authTokenMissing });

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using the secret and decode it
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.userData = decoded; // Attach decoded user data to the request object, and this userData will be available for further middleware.
    next();
  } catch (error) {
    res.status(401).json({ message: AUTH_MESSAGES.invalidOrExpiredToken });
  }
};
