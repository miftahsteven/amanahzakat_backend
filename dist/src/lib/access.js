"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenAccess = flattenAccess;
exports.buildNavigation = buildNavigation;
exports.menuCodesFromNavigation = menuCodesFromNavigation;
const prisma_1 = require("./prisma");
function flattenAccess(userRoles) {
    const roles = userRoles.map((ur) => ur.role.kodeRole);
    const permissionSet = new Set();
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
async function buildNavigation(roles, permissions) {
    const isSuperAdmin = roles.includes('SUPER_ADMIN');
    const modules = await prisma_1.prisma.modul.findMany({
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
            if (isSuperAdmin)
                return true;
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
function menuCodesFromNavigation(navigation) {
    return navigation.flatMap((modul) => modul.menus.map((menu) => menu.kodeMenu));
}
