"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authentication_1 = require("../middlewares/authentication");
const authorization_1 = require("../middlewares/authorization");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
router.use(authentication_1.authenticateJWT, (0, authorization_1.authorizeRoles)(["admin"])); //Only logged in admin user can perform all these opeartions.
// @route   GET /api/users
// @desc    Get all users
// @access  Admin
router.get("/", userController_1.getUsers);
// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Admin
router.get("/:id", userController_1.getUser);
// @route   PUT /api/users/:id
// @desc    Update user by ID
// @access  Admin
router.put("/:id", [
    (0, express_validator_1.body)("username")
        .optional()
        .notEmpty()
        .withMessage("Username cannot be empty"),
    (0, express_validator_1.body)("email")
        .optional()
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .optional()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    (0, express_validator_1.body)("role")
        .optional()
        .isIn(["admin", "user"])
        .withMessage("Role must be admin or user"),
], userController_1.updateUserController);
// @route   DELETE /api/users/:id
// @desc    Delete user by ID
// @access  Admin
router.delete("/:id", userController_1.deleteUserController);
exports.default = router;
