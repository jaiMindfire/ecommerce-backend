"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
// Middleware function to authorize user roles
const authorizeRoles = (roles) => {
    return (req, res, next) => {
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
exports.authorizeRoles = authorizeRoles;
