"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const environment_1 = require("../../config/environment");
class AuthService {
    /**
     * Step 1: Login with username/email & password
     * Generates OTP Challenge Token (Dummy OTP: 00000)
     */
    static async login(input, ipAddress) {
        const { usernameOrEmail, password } = input;
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [
                    { username: usernameOrEmail },
                    { email: usernameOrEmail },
                ],
            },
        });
        if (!user) {
            throw { statusCode: 401, message: 'Username atau email tidak terdaftar.' };
        }
        if (!user.isActive) {
            throw { statusCode: 403, message: 'Akun Anda dinonaktifkan. Silakan hubungi Administrator.' };
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw { statusCode: 401, message: 'Password yang Anda masukkan salah.' };
        }
        // Create OTP Token record (expires in 10 minutes)
        const otpRecord = await prisma_1.prisma.otpToken.create({
            data: {
                userId: user.id,
                code: environment_1.config.dummyOtp, // "00000"
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                isUsed: false,
            },
        });
        await prisma_1.prisma.auditTrail.create({
            data: {
                userId: user.id,
                action: 'AUTH_LOGIN_CHALLENGE',
                details: { challengeId: otpRecord.id },
                ipAddress,
            },
        });
        return {
            challengeId: otpRecord.id,
            message: 'Kredensial valid. Silakan masukkan kode OTP 5 digit (Dummy OTP: 00000).',
            expiresInSeconds: 600,
        };
    }
    /**
     * Step 2: Verify 5-digit OTP Code (Dummy: 00000)
     * Issues AccessToken (JWT) & RefreshToken
     */
    static async verifyOtp(input, ipAddress) {
        const { challengeId, otp } = input;
        const otpRecord = await prisma_1.prisma.otpToken.findUnique({
            where: { id: challengeId },
            include: {
                user: {
                    include: {
                        userRoles: {
                            include: {
                                role: {
                                    include: {
                                        rolePermissions: {
                                            include: {
                                                permission: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!otpRecord) {
            throw { statusCode: 404, message: 'Tantangan OTP tidak ditemukan atau telah kadaluarsa.' };
        }
        if (otpRecord.isUsed) {
            throw { statusCode: 400, message: 'Kode OTP ini telah digunakan sebelumnya.' };
        }
        if (new Date() > otpRecord.expiresAt) {
            throw { statusCode: 400, message: 'Kode OTP telah kadaluarsa. Silakan login kembali.' };
        }
        if (otp !== otpRecord.code && otp !== environment_1.config.dummyOtp) {
            throw { statusCode: 400, message: 'Kode OTP yang Anda masukkan salah (Gunakan: 00000).' };
        }
        // Mark OTP as used and user verified
        await prisma_1.prisma.otpToken.update({
            where: { id: challengeId },
            data: { isUsed: true },
        });
        await prisma_1.prisma.user.update({
            where: { id: otpRecord.userId },
            data: { isOtpVerified: true },
        });
        const user = otpRecord.user;
        const roles = user.userRoles.map((ur) => ur.role.kodeRole);
        const permissionSet = new Set();
        user.userRoles.forEach((ur) => {
            ur.role.rolePermissions.forEach((rp) => {
                permissionSet.add(rp.permission.kodePermission);
            });
        });
        const permissions = Array.from(permissionSet);
        // Issue JWT tokens
        const accessTokenOptions = { expiresIn: '1d' };
        const refreshTokenOptions = { expiresIn: '7d' };
        const accessToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            username: user.username,
            email: user.email,
            roles,
        }, environment_1.config.jwtSecret, accessTokenOptions);
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, environment_1.config.jwtRefreshSecret, refreshTokenOptions);
        await prisma_1.prisma.auditTrail.create({
            data: {
                userId: user.id,
                action: 'AUTH_VERIFY_OTP_SUCCESS',
                details: { roles },
                ipAddress,
            },
        });
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: environment_1.config.jwtExpiresIn,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                namaLengkap: user.namaLengkap,
                nomorHp: user.nomorHp,
                nip: user.nip,
                roles,
                permissions,
            },
        };
    }
    /**
     * Get Current Authenticated User Profile & Permissions
     */
    static async getCurrentUser(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw { statusCode: 404, message: 'User tidak ditemukan.' };
        }
        const roles = user.userRoles.map((ur) => ur.role.kodeRole);
        const permissionSet = new Set();
        user.userRoles.forEach((ur) => {
            ur.role.rolePermissions.forEach((rp) => {
                permissionSet.add(rp.permission.kodePermission);
            });
        });
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            namaLengkap: user.namaLengkap,
            nomorHp: user.nomorHp,
            nip: user.nip,
            isActive: user.isActive,
            isOtpVerified: user.isOtpVerified,
            roles,
            permissions: Array.from(permissionSet),
        };
    }
    /**
     * Refresh Access Token
     */
    static async refreshToken(refreshTokenInput) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshTokenInput, environment_1.config.jwtRefreshSecret);
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                include: {
                    userRoles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
            if (!user || !user.isActive) {
                throw { statusCode: 401, message: 'Refresh token tidak valid atau pengguna dinonaktifkan.' };
            }
            const roles = user.userRoles.map((ur) => ur.role.kodeRole);
            const accessTokenOptions = { expiresIn: '1d' };
            const accessToken = jsonwebtoken_1.default.sign({
                userId: user.id,
                username: user.username,
                email: user.email,
                roles,
            }, environment_1.config.jwtSecret, accessTokenOptions);
            return {
                accessToken,
                tokenType: 'Bearer',
                expiresIn: environment_1.config.jwtExpiresIn,
            };
        }
        catch (err) {
            throw { statusCode: 401, message: 'Refresh token tidak valid atau kadaluarsa.' };
        }
    }
}
exports.AuthService = AuthService;
