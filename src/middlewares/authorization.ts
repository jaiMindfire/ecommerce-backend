import { Request, Response, NextFunction } from "express";

// Middleware function to authorize user roles
export const authorizeRoles = (roles: Array<"admin" | "user">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.userData.role)) {
      // Respond with 403 Forbidden if the user does not have permission
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }
    next(); // Call the next middleware if authorization is successful
  };
};
