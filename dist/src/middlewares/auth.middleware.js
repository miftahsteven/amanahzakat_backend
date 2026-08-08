"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../config/environment");
const prisma_1 = require("../lib/prisma");
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Akses ditolak: Token autentikasi Bearer tidak ditemukan.',
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwtSecret);
        // Fetch user with fresh roles and permissions
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
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
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Akses ditolak: Pengguna tidak aktif atau tidak terdaftar.',
            });
            return;
        }
        const roles = user.userRoles.map((ur) => ur.role.kodeRole);
        const permissionSet = new Set();
        user.userRoles.forEach((ur) => {
            ur.role.rolePermissions.forEach((rp) => {
                permissionSet.add(rp.permission.kodePermission);
            });
        });
        req.user = {
            userId: user.id,
            username: user.username,
            email: user.email,
            namaLengkap: user.namaLengkap,
            roles,
            permissions: Array.from(permissionSet),
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Akses ditolak: Token JWT kadaluarsa atau tidak valid.',
        });
    }
};
exports.authenticateJWT = authenticateJWT;
