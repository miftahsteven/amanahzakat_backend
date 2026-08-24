import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const modul = await prisma.modul.findUnique({ where: { kodeModul: 'KEUANGAN' } });
  if (!modul) throw new Error('Modul KEUANGAN tidak ditemukan');

  const menu = await prisma.menu.upsert({
    where: { kodeMenu: 'laporan-keuangan' },
    update: {
      modulId: modul.id,
      namaMenu: 'Laporan Keuangan PSAK 109',
      kodeTampil: 'LK',
      icon: 'Receipt',
      urutan: 2,
      isActive: true,
    },
    create: {
      modulId: modul.id,
      kodeMenu: 'laporan-keuangan',
      namaMenu: 'Laporan Keuangan PSAK 109',
      kodeTampil: 'LK',
      icon: 'Receipt',
      urutan: 2,
    },
  });

  const actions = [
    { aksi: 'read', nama: 'Lihat Laporan Keuangan PSAK 109' },
    { aksi: 'export', nama: 'Ekspor Laporan Keuangan' },
  ] as const;

  const permissionIds: string[] = [];
  for (const action of actions) {
    const kodePermission = `laporan-keuangan.${action.aksi}`;
    const perm = await prisma.permission.upsert({
      where: { kodePermission },
      update: { namaPermission: action.nama, aksi: action.aksi, menuId: menu.id },
      create: { kodePermission, namaPermission: action.nama, aksi: action.aksi, menuId: menu.id },
    });
    permissionIds.push(perm.id);
  }

  const superAdmin = await prisma.role.findUnique({ where: { kodeRole: 'SUPER_ADMIN' } });
  if (superAdmin) {
    for (const permissionId of permissionIds) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superAdmin.id, permissionId } },
        update: {},
        create: { roleId: superAdmin.id, permissionId },
      });
    }
  }

  console.log('✅ Menu laporan-keuangan + permissions seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
