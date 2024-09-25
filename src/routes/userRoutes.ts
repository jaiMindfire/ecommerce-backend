import express from "express";
import {
  getUser,
  getUsers,
  updateUserController,
  deleteUserController,
} from "../controllers/userController";
import { authenticateJWT } from "../middlewares/authentication";
import { authorizeRoles } from "../middlewares/authorization";
import { body } from "express-validator";

const router = express.Router();

router.use(authenticateJWT, authorizeRoles(["admin"]));

// @route   GET /api/users
// @desc    Get all users
// @access  Admin
router.get("/", getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Admin
router.get("/:id", getUser);

// @route   PUT /api/users/:id
// @desc    Update user by ID
// @access  Admin
router.put(
  "/:id",
  [
    body("username")
      .optional()
      .notEmpty()
      .withMessage("Username cannot be empty"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["admin", "user"])
      .withMessage("Role must be admin or user"),
  ],
  updateUserController
);

// @route   DELETE /api/users/:id
// @desc    Delete user by ID
// @access  Admin
router.delete("/:id", deleteUserController);

export default router;
