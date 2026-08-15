import { prisma } from '../../lib/prisma';

export class AclService {
  static async getModulesCatalog(includeInactive = false) {
    return prisma.modul.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        menus: {
          where: includeInactive ? undefined : { isActive: true },
          include: {
            permissions: {
              orderBy: { kodePermission: 'asc' },
            },
          },
          orderBy: { urutan: 'asc' },
        },
      },
      orderBy: { urutan: 'asc' },
    });
  }

  static async createModul(data: {
    kodeModul: string;
    namaModul: string;
    urutan?: number;
  }) {
    const kodeModul = data.kodeModul.trim().toUpperCase().replace(/\s+/g, '_');
    const exists = await prisma.modul.findUnique({ where: { kodeModul } });
    if (exists) {
      throw { statusCode: 400, message: `Kode modul ${kodeModul} sudah ada.` };
    }

    return prisma.modul.create({
      data: {
        kodeModul,
        namaModul: data.namaModul.trim(),
        urutan: data.urutan ?? 0,
      },
    });
  }

  static async updateModul(
    id: string,
    data: {
      namaModul?: string;
      urutan?: number;
      isActive?: boolean;
    }
  ) {
    const modul = await prisma.modul.findUnique({ where: { id } });
    if (!modul) {
      throw { statusCode: 404, message: 'Modul tidak ditemukan.' };
    }

    return prisma.modul.update({
      where: { id },
      data: {
        namaModul: data.namaModul?.trim(),
        urutan: data.urutan,
        isActive: data.isActive,
      },
    });
  }

  static async deleteModul(id: string) {
    const modul = await prisma.modul.findUnique({
      where: { id },
      include: { menus: true },
    });
    if (!modul) {
      throw { statusCode: 404, message: 'Modul tidak ditemukan.' };
    }

    await prisma.$transaction([
      prisma.menu.updateMany({
        where: { modulId: id },
        data: { isActive: false },
      }),
      prisma.modul.update({
        where: { id },
        data: { isActive: false },
      }),
    ]);

    return { id, isActive: false };
  }

  static async createMenu(data: {
    modulId: string;
    kodeMenu: string;
    namaMenu: string;
    kodeTampil: string;
    icon?: string | null;
    urutan?: number;
    tampilDiSidebar?: boolean;
    tampilDiHeader?: boolean;
    actions?: string[];
  }) {
    const modul = await prisma.modul.findUnique({ where: { id: data.modulId } });
    if (!modul) {
      throw { statusCode: 404, message: 'Modul tidak ditemukan.' };
    }

    const kodeMenu = data.kodeMenu.trim().toLowerCase().replace(/\s+/g, '-');
    const exists = await prisma.menu.findUnique({ where: { kodeMenu } });
    if (exists) {
      throw { statusCode: 400, message: `Kode menu ${kodeMenu} sudah ada.` };
    }

    const actions = data.actions?.length ? data.actions : ['read'];
    const uniqueActions = Array.from(new Set(actions.map((a) => a.trim().toLowerCase()).filter(Boolean)));
    if (!uniqueActions.includes('read')) {
      uniqueActions.unshift('read');
    }

    const icon = data.icon?.trim() ? data.icon.trim() : null;

    const menu = await prisma.menu.create({
      data: {
        modulId: data.modulId,
        kodeMenu,
        namaMenu: data.namaMenu.trim(),
        kodeTampil: data.kodeTampil.trim().toUpperCase().slice(0, 4),
        icon,
        urutan: data.urutan ?? 0,
        tampilDiSidebar: data.tampilDiSidebar ?? true,
        tampilDiHeader: data.tampilDiHeader ?? false,
        permissions: {
          create: uniqueActions.map((aksi) => ({
            kodePermission: `${kodeMenu}.${aksi}`,
            namaPermission: `${aksi === 'read' ? 'Lihat' : 'Kelola'} ${data.namaMenu.trim()} (${aksi})`,
            aksi,
          })),
        },
      },
      include: {
        permissions: true,
        modul: true,
      },
    });

    const superAdmin = await prisma.role.findUnique({ where: { kodeRole: 'SUPER_ADMIN' } });
    if (superAdmin && menu.permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: menu.permissions.map((permission) => ({
          roleId: superAdmin.id,
          permissionId: permission.id,
        })),
        skipDuplicates: true,
      });
    }

    return menu;
  }

  static async updateMenu(
    id: string,
    data: {
      namaMenu?: string;
      kodeTampil?: string;
      icon?: string | null;
      urutan?: number;
      tampilDiSidebar?: boolean;
      tampilDiHeader?: boolean;
      isActive?: boolean;
      modulId?: string;
    }
  ) {
    const menu = await prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw { statusCode: 404, message: 'Menu tidak ditemukan.' };
    }

    if (data.modulId) {
      const modul = await prisma.modul.findUnique({ where: { id: data.modulId } });
      if (!modul) {
        throw { statusCode: 404, message: 'Modul tujuan tidak ditemukan.' };
      }
    }

    const icon =
      data.icon === undefined ? undefined : data.icon?.trim() ? data.icon.trim() : null;

    return prisma.menu.update({
      where: { id },
      data: {
        namaMenu: data.namaMenu?.trim(),
        kodeTampil: data.kodeTampil?.trim().toUpperCase().slice(0, 4),
        icon,
        urutan: data.urutan,
        tampilDiSidebar: data.tampilDiSidebar,
        tampilDiHeader: data.tampilDiHeader,
        isActive: data.isActive,
        modulId: data.modulId,
      },
      include: {
        permissions: true,
        modul: true,
      },
    });
  }

  static async deleteMenu(id: string) {
    const menu = await prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw { statusCode: 404, message: 'Menu tidak ditemukan.' };
    }

    return prisma.menu.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async getRoles() {
    return prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: {
              include: {
                menu: {
                  include: {
                    modul: true,
                  },
                },
              },
            },
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
      include: {
        menu: {
          include: {
            modul: true,
          },
        },
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
      orderBy: [{ kodePermission: 'asc' }],
    });
  }

  static async createPermission(data: {
    kodePermission?: string;
    namaPermission: string;
    aksi: string;
    menuId: string;
  }) {
    const menu = await prisma.menu.findUnique({ where: { id: data.menuId } });
    if (!menu) {
      throw { statusCode: 404, message: 'Menu tidak ditemukan.' };
    }

    const aksi = data.aksi.trim().toLowerCase();
    const kodePermission = (data.kodePermission || `${menu.kodeMenu}.${aksi}`).trim().toLowerCase();

    const exists = await prisma.permission.findUnique({
      where: { kodePermission },
    });

    if (exists) {
      throw { statusCode: 400, message: `Kode permission ${kodePermission} sudah ada.` };
    }

    const duplicateAksi = await prisma.permission.findUnique({
      where: {
        menuId_aksi: {
          menuId: data.menuId,
          aksi,
        },
      },
    });
    if (duplicateAksi) {
      throw { statusCode: 400, message: `Aksi ${aksi} sudah ada untuk menu ${menu.kodeMenu}.` };
    }

    const permission = await prisma.permission.create({
      data: {
        kodePermission,
        namaPermission: data.namaPermission.trim(),
        aksi,
        menuId: data.menuId,
      },
      include: {
        menu: { include: { modul: true } },
        rolePermissions: { include: { role: true } },
      },
    });

    const superAdmin = await prisma.role.findUnique({ where: { kodeRole: 'SUPER_ADMIN' } });
    if (superAdmin) {
      await prisma.rolePermission.createMany({
        data: [{ roleId: superAdmin.id, permissionId: permission.id }],
        skipDuplicates: true,
      });
    }

    return prisma.permission.findUnique({
      where: { id: permission.id },
      include: {
        menu: { include: { modul: true } },
        rolePermissions: { include: { role: true } },
      },
    });
  }

  static async updatePermission(
    id: string,
    data: {
      namaPermission?: string;
      aksi?: string;
      kodePermission?: string;
    }
  ) {
    const permission = await prisma.permission.findUnique({ where: { id } });
    if (!permission) {
      throw { statusCode: 404, message: 'Permission tidak ditemukan.' };
    }

    const aksi = data.aksi?.trim().toLowerCase();
    const kodePermission = data.kodePermission?.trim().toLowerCase();

    if (aksi && aksi !== permission.aksi) {
      const duplicateAksi = await prisma.permission.findUnique({
        where: {
          menuId_aksi: {
            menuId: permission.menuId,
            aksi,
          },
        },
      });
      if (duplicateAksi && duplicateAksi.id !== id) {
        throw { statusCode: 400, message: `Aksi ${aksi} sudah dipakai permission lain di menu ini.` };
      }
    }

    if (kodePermission && kodePermission !== permission.kodePermission) {
      const exists = await prisma.permission.findUnique({ where: { kodePermission } });
      if (exists) {
        throw { statusCode: 400, message: `Kode permission ${kodePermission} sudah ada.` };
      }
    }

    return prisma.permission.update({
      where: { id },
      data: {
        namaPermission: data.namaPermission?.trim(),
        aksi,
        kodePermission,
      },
      include: {
        menu: { include: { modul: true } },
        rolePermissions: { include: { role: true } },
      },
    });
  }

  static async deletePermission(id: string) {
    const permission = await prisma.permission.findUnique({ where: { id } });
    if (!permission) {
      throw { statusCode: 404, message: 'Permission tidak ditemukan.' };
    }

    const protectedCodes = [
      'acl-management.manage',
      'acl-management.read',
      'permission-management.manage',
      'permission-management.read',
      'module-management.manage',
      'user-management.manage',
    ];
    if (protectedCodes.includes(permission.kodePermission)) {
      throw {
        statusCode: 400,
        message: `Permission sistem ${permission.kodePermission} tidak boleh dihapus.`,
      };
    }

    await prisma.permission.delete({ where: { id } });
    return { id };
  }

  static async syncPermissionRoles(permissionId: string, roleIds: string[]) {
    const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
    if (!permission) {
      throw { statusCode: 404, message: 'Permission tidak ditemukan.' };
    }

    const uniqueRoleIds = Array.from(new Set(roleIds));
    const roles = await prisma.role.findMany({
      where: { id: { in: uniqueRoleIds } },
    });
    if (roles.length !== uniqueRoleIds.length) {
      throw { statusCode: 400, message: 'Beberapa role tidak ditemukan.' };
    }

    const superAdmin = await prisma.role.findUnique({ where: { kodeRole: 'SUPER_ADMIN' } });
    if (
      superAdmin &&
      (permission.kodePermission === 'acl-management.manage' ||
        permission.kodePermission === 'permission-management.manage') &&
      !uniqueRoleIds.includes(superAdmin.id)
    ) {
      throw {
        statusCode: 400,
        message: 'SUPER_ADMIN wajib mempertahankan permission kritis sistem.',
      };
    }

    await prisma.rolePermission.deleteMany({ where: { permissionId } });

    if (uniqueRoleIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: uniqueRoleIds.map((roleId) => ({ roleId, permissionId })),
        skipDuplicates: true,
      });
    }

    return prisma.permission.findUnique({
      where: { id: permissionId },
      include: {
        menu: { include: { modul: true } },
        rolePermissions: { include: { role: true } },
      },
    });
  }

  static async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw { statusCode: 404, message: 'Role tidak ditemukan.' };
    }

    if (role.kodeRole === 'SUPER_ADMIN') {
      const aclManage = await prisma.permission.findUnique({
        where: { kodePermission: 'acl-management.manage' },
      });
      if (aclManage && !permissionIds.includes(aclManage.id)) {
        throw {
          statusCode: 400,
          message: 'Role SUPER_ADMIN wajib mempertahankan izin acl-management.manage.',
        };
      }
    }

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
