import { Request, Response, NextFunction } from "express";

export const authorizeRoles = (roles: Array<"admin" | "user">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.userData.role)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
};
