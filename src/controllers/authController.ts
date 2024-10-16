// 3rd Party Imports
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
// Static Imports
import { registerUser, loginUser } from "@services/userService";
import { LOGIN_MESSAGES } from "src/Contants";

//register function to handle user registration
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are errors, return a 400 status with the errors
      return res.status(400).json({ errors: errors.array() });
    }

    // Call the registerUser service with the request body
    const user = await registerUser(req.body);
    // Respond with a 201 status and the user details
    res.status(201).json({
      message: LOGIN_MESSAGES.userRegistered,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Pass any errors to the next middleware(error handler)
    next(error);
  }
};

//login function to handle user login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are errors, return a 400 status with the errors
      return res.status(400).json({ errors: errors.array() });
    }

    // Call the loginUser service with the request body
    const data = await loginUser(req.body);
    // Respond with a 200 status and token/user information
    res.status(200).json({
      message: LOGIN_MESSAGES.loginSuccess,
      token: data.token,
      success: true,
      userName: data.userName,
    });
  } catch (error) {
    // Respond with a 401 status and error message if login fails
    next(error);
  }
};
