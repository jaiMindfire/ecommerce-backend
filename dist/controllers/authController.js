"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
// Static Imports
const userService_1 = require("@services/userService");
const Contants_1 = require("src/Contants");
//register function to handle user registration
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors in the request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            // If there are errors, return a 400 status with the errors
            return res.status(400).json({ errors: errors.array() });
        }
        // Call the registerUser service with the request body
        const user = yield (0, userService_1.registerUser)(req.body);
        // Respond with a 201 status and the user details
        res.status(201).json({
            message: Contants_1.LOGIN_MESSAGES.userRegistered,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        // Pass any errors to the next middleware(error handler)
        next(error);
    }
});
exports.register = register;
//login function to handle user login
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors in the request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            // If there are errors, return a 400 status with the errors
            return res.status(400).json({ errors: errors.array() });
        }
        // Call the loginUser service with the request body
        const data = yield (0, userService_1.loginUser)(req.body);
        // Respond with a 200 status and token/user information
        res.status(200).json({
            message: Contants_1.LOGIN_MESSAGES.loginSuccess,
            token: data.token,
            success: true,
            userName: data.userName,
        });
    }
    catch (error) {
        // Respond with a 401 status and error message if login fails
        next(error);
    }
});
exports.login = login;
