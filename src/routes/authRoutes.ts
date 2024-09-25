import express from "express";
import { register, login } from "../controllers/authController";
import { registerValidation, loginValidation } from "../middlewares/validators";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerValidation, register);

// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post("/login", loginValidation, login);

export default router;
