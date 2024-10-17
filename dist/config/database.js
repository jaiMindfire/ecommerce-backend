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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Contants_1 = require("src/Contants");
dotenv_1.default.config(); // Load environment variables from .env file into process.env
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //connect to the database using the connection URI from environment variables
        yield mongoose_1.default.connect(process.env.MONGO_URI);
        console.log(Contants_1.DATABASE_SUCCESS_MESSAGE);
    }
    catch (error) {
        console.error(`${Contants_1.DATABASE_ERROR_MESSAGE} ${error}`);
        process.exit(1); // Exit the process with an error code
    }
});
exports.connectDB = connectDB;
// Function to close the database connection
const closeDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connection.close();
        console.log("Database connection closed.");
    }
    catch (error) {
        console.error(`Error closing the database connection: ${error}`);
    }
});
exports.closeDB = closeDB;
