import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/userService";
import { validationResult } from "express-validator";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await registerUser(req.body);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const data = await loginUser(req.body);
    res.status(200).json({
      message: "Logged in successfully",
      token: data.token,
      success: true,
      userName: data.userName,
    });
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
};
