import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Tambah permission program.delete ke SUPER_ADMIN (tanpa full seed) */
async function main() {
  const menu = await prisma.menu.findUnique({ where: { kodeMenu: 'program' } });
  if (!menu) throw new Error('Menu program tidak ditemukan');

  const perm = await prisma.permission.upsert({
    where: { kodePermission: 'program.delete' },
    update: {
      namaPermission: 'Hapus Program ZIS',
      aksi: 'delete',
      menuId: menu.id,
    },
    create: {
      kodePermission: 'program.delete',
      namaPermission: 'Hapus Program ZIS',
      aksi: 'delete',
      menuId: menu.id,
    },
  });

  const superAdmin = await prisma.role.findUnique({ where: { kodeRole: 'SUPER_ADMIN' } });
  if (superAdmin) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdmin.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdmin.id, permissionId: perm.id },
    });
  }

  console.log('✅ Permission program.delete seeded for SUPER_ADMIN');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
