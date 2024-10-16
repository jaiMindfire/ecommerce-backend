import express from "express";
import { register, login } from "../controllers/authController";
import { registerValidation, loginValidation } from "../middlewares/validators";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// @request { body: { password: "string", email: "string" } }
// @response { user: { id: "string", username: "string", email: "string" }, message: "string" }
router.post("/register", registerValidation, register);

// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
// @request { body: { email: "string", password: "string" } }
// @response { token: "string", userName: "string",success: "boolean", message: "string" }
router.post("/login", loginValidation, login);

export default router;
