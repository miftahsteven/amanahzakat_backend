"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'amanah_zakat_secret_key_2026_super_secure_99',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'amanah_zakat_refresh_secret_key_2026',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    dummyOtp: process.env.DUMMY_OTP || '00000',
};
