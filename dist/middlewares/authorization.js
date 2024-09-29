"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userData.role)) {
            return res
                .status(403)
                .json({ message: "You do not have permission to perform this action" });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
