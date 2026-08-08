"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AclService = void 0;
const prisma_1 = require("../../lib/prisma");
class AclService {
    static async getRoles() {
        return prisma_1.prisma.role.findMany({
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: { userRoles: true },
                },
            },
            orderBy: { kodeRole: 'asc' },
        });
    }
    static async createRole(data) {
        const exists = await prisma_1.prisma.role.findUnique({
            where: { kodeRole: data.kodeRole },
        });
        if (exists) {
            throw { statusCode: 400, message: `Kode role ${data.kodeRole} sudah ada.` };
        }
        return prisma_1.prisma.role.create({
            data: {
                kodeRole: data.kodeRole.toUpperCase(),
                namaRole: data.namaRole,
                deskripsi: data.deskripsi,
            },
        });
    }
    static async getPermissions() {
        return prisma_1.prisma.permission.findMany({
            orderBy: [{ modul: 'asc' }, { kodePermission: 'asc' }],
        });
    }
    static async createPermission(data) {
        const exists = await prisma_1.prisma.permission.findUnique({
            where: { kodePermission: data.kodePermission },
        });
        if (exists) {
            throw { statusCode: 400, message: `Kode permission ${data.kodePermission} sudah ada.` };
        }
        return prisma_1.prisma.permission.create({
            data,
        });
    }
    static async assignPermissionsToRole(roleId, permissionIds) {
        // Delete existing permissions for this role
        await prisma_1.prisma.rolePermission.deleteMany({
            where: { roleId },
        });
        // Create new relations
        const relations = permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
        }));
        await prisma_1.prisma.rolePermission.createMany({
            data: relations,
        });
        return prisma_1.prisma.role.findUnique({
            where: { id: roleId },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
}
exports.AclService = AclService;
