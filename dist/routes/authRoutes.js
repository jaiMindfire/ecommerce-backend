"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const validators_1 = require("../middlewares/validators");
const router = express_1.default.Router();
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", validators_1.registerValidation, authController_1.register);
// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post("/login", validators_1.loginValidation, authController_1.login);
exports.default = router;
