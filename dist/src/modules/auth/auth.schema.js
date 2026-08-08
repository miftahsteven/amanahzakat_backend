"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.verifyOtpSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        usernameOrEmail: zod_1.z.string().min(3, 'Username atau email minimal 3 karakter'),
        password: zod_1.z.string().min(6, 'Password minimal 6 karakter'),
    }),
});
exports.verifyOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        challengeId: zod_1.z.string().min(1, 'Challenge ID wajib diisi'),
        otp: zod_1.z.string().length(5, 'Kode OTP harus tepat 5 digit (Gunakan: 00000)'),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh Token wajib diisi'),
    }),
});
