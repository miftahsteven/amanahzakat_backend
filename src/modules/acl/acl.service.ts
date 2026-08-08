import { prisma } from '../../lib/prisma';

export class AclService {
  static async getRoles() {
    return prisma.role.findMany({
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

  static async createRole(data: { kodeRole: string; namaRole: string; deskripsi?: string }) {
    const exists = await prisma.role.findUnique({
      where: { kodeRole: data.kodeRole },
    });

    if (exists) {
      throw { statusCode: 400, message: `Kode role ${data.kodeRole} sudah ada.` };
    }

    return prisma.role.create({
      data: {
        kodeRole: data.kodeRole.toUpperCase(),
        namaRole: data.namaRole,
        deskripsi: data.deskripsi,
      },
    });
  }

  static async getPermissions() {
    return prisma.permission.findMany({
      orderBy: [{ modul: 'asc' }, { kodePermission: 'asc' }],
    });
  }

  static async createPermission(data: { kodePermission: string; namaPermission: string; modul: string }) {
    const exists = await prisma.permission.findUnique({
      where: { kodePermission: data.kodePermission },
    });

    if (exists) {
      throw { statusCode: 400, message: `Kode permission ${data.kodePermission} sudah ada.` };
    }

    return prisma.permission.create({
      data,
    });
  }

  static async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    // Delete existing permissions for this role
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Create new relations
    const relations = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));

    await prisma.rolePermission.createMany({
      data: relations,
    });

    return prisma.role.findUnique({
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
