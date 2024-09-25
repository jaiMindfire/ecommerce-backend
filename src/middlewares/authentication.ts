import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface JwtPayload {
  id: string;
  role: "admin" | "user";
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      userData: JwtPayload;
    }
  }
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Authorization token missing" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.userData = decoded;
    next();
  } catch (error) {
    console.log(error, "error");
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
