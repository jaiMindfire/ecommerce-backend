"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const customError_1 = require("@utils/customError");
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof customError_1.CustomError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json(Object.assign({ message: err.message || "Internal Server Error" }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
