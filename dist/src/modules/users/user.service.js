"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../lib/prisma");
class UserService {
    static async getUsers() {
        return prisma_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                namaLengkap: true,
                nomorHp: true,
                nip: true,
                isActive: true,
                isOtpVerified: true,
                userRoles: {
                    include: {
                        role: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getUserById(id) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                namaLengkap: true,
                nomorHp: true,
                nip: true,
                isActive: true,
                isOtpVerified: true,
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
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw { statusCode: 404, message: 'User tidak ditemukan.' };
        }
        return user;
    }
    static async createUser(data) {
        const existing = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ username: data.username }, { email: data.email }],
            },
        });
        if (existing) {
            throw { statusCode: 400, message: 'Username atau Email sudah terdaftar.' };
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                passwordHash,
                namaLengkap: data.namaLengkap,
                nomorHp: data.nomorHp,
                nip: data.nip,
                isActive: true,
            },
        });
        if (data.roleIds && data.roleIds.length > 0) {
            await prisma_1.prisma.userRole.createMany({
                data: data.roleIds.map((roleId) => ({
                    userId: user.id,
                    roleId,
                })),
            });
        }
        return this.getUserById(user.id);
    }
    static async updateUser(id, data) {
        const updateData = {};
        if (data.namaLengkap !== undefined)
            updateData.namaLengkap = data.namaLengkap;
        if (data.nomorHp !== undefined)
            updateData.nomorHp = data.nomorHp;
        if (data.nip !== undefined)
            updateData.nip = data.nip;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        if (data.password) {
            updateData.passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        }
        await prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
        });
        if (data.roleIds !== undefined) {
            await prisma_1.prisma.userRole.deleteMany({ where: { userId: id } });
            if (data.roleIds.length > 0) {
                await prisma_1.prisma.userRole.createMany({
                    data: data.roleIds.map((roleId) => ({
                        userId: id,
                        roleId,
                    })),
                });
            }
        }
        return this.getUserById(id);
    }
    static async deleteUser(id) {
        return prisma_1.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
exports.UserService = UserService;
