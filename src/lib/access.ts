import { prisma } from './prisma';

export type NavMenu = {
  kodeMenu: string;
  namaMenu: string;
  kodeTampil: string;
  icon: string | null;
  urutan: number;
  tampilDiSidebar: boolean;
  tampilDiHeader: boolean;
};

export type NavModul = {
  kodeModul: string;
  namaModul: string;
  urutan: number;
  menus: NavMenu[];
};

type RolePermissionNode = {
  role: {
    kodeRole: string;
    rolePermissions: {
      permission: { kodePermission: string };
    }[];
  };
};

export function flattenAccess(userRoles: RolePermissionNode[]) {
  const roles = userRoles.map((ur) => ur.role.kodeRole);
  const permissionSet = new Set<string>();

  userRoles.forEach((ur) => {
    ur.role.rolePermissions.forEach((rp) => {
      permissionSet.add(rp.permission.kodePermission);
    });
  });

  return {
    roles,
    permissions: Array.from(permissionSet),
  };
}

export async function buildNavigation(roles: string[], permissions: string[]): Promise<NavModul[]> {
  const isSuperAdmin = roles.includes('SUPER_ADMIN');

  const modules = await prisma.modul.findMany({
    where: { isActive: true },
    include: {
      menus: {
        where: { isActive: true },
        include: { permissions: true },
        orderBy: { urutan: 'asc' },
      },
    },
    orderBy: { urutan: 'asc' },
  });

  return modules
    .map((modul) => ({
      kodeModul: modul.kodeModul,
      namaModul: modul.namaModul,
      urutan: modul.urutan,
      menus: modul.menus
        .filter((menu) => {
          if (isSuperAdmin) return true;
          return menu.permissions.some((permission) => permissions.includes(permission.kodePermission));
        })
        .map((menu) => ({
          kodeMenu: menu.kodeMenu,
          namaMenu: menu.namaMenu,
          kodeTampil: menu.kodeTampil,
          icon: menu.icon,
          urutan: menu.urutan,
          tampilDiSidebar: menu.tampilDiSidebar,
          tampilDiHeader: menu.tampilDiHeader,
        })),
    }))
    .filter((modul) => modul.menus.length > 0);
}

export function menuCodesFromNavigation(navigation: NavModul[]): string[] {
  return navigation.flatMap((modul) => modul.menus.map((menu) => menu.kodeMenu));
}
