"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    static async login(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.login(req.body, req.ip);
            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    challengeId: result.challengeId,
                    expiresInSeconds: result.expiresInSeconds,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyOtp(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.verifyOtp(req.body, req.ip);
            res.status(200).json({
                success: true,
                message: 'Verifikasi OTP berhasil. Selamat datang di Amanah Zakat ERP!',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async me(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.getCurrentUser(req.user.userId);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.refreshToken(req.body.refreshToken);
            res.status(200).json({
                success: true,
                message: 'Token berhasil diperbarui.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
