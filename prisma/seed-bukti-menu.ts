import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding menu Bukti Setor Zakat (BSZ)...');

  const modul = await prisma.modul.upsert({
    where: { kodeModul: 'PELAPORAN' },
    update: { namaModul: 'PELAPORAN', urutan: 5, isActive: true },
    create: { kodeModul: 'PELAPORAN', namaModul: 'PELAPORAN', urutan: 5, isActive: true },
  });

  const menu = await prisma.menu.upsert({
    where: { kodeMenu: 'bukti' },
    update: {
      namaMenu: 'Bukti Setor Zakat (BSZ)',
      kodeTampil: 'BZ',
      icon: 'FileSpreadsheet',
      urutan: 1,
      isActive: true,
      tampilDiSidebar: true,
      modulId: modul.id,
    },
    create: {
      kodeMenu: 'bukti',
      namaMenu: 'Bukti Setor Zakat (BSZ)',
      kodeTampil: 'BZ',
      icon: 'FileSpreadsheet',
      urutan: 1,
      isActive: true,
      tampilDiSidebar: true,
      modulId: modul.id,
    },
  });

  const actions = [
    { aksi: 'read', nama: 'Lihat Bukti Setor Zakat' },
    { aksi: 'export', nama: 'Unduh / Cetak BSZ PDF' },
  ];

  const permissionIds: string[] = [];
  for (const action of actions) {
    const kodePermission = `bukti.${action.aksi}`;
    const perm = await prisma.permission.upsert({
      where: { kodePermission },
      update: { namaPermission: action.nama, menuId: menu.id, aksi: action.aksi },
      create: {
        kodePermission,
        namaPermission: action.nama,
        menuId: menu.id,
        aksi: action.aksi,
      },
    });
    permissionIds.push(perm.id);
  }

  const superAdmin = await prisma.role.findUnique({ where: { kodeRole: 'SUPER_ADMIN' } });
  if (superAdmin) {
    for (const permissionId of permissionIds) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: superAdmin.id, permissionId },
        },
        update: {},
        create: { roleId: superAdmin.id, permissionId },
      });
    }
  }

  // Reorder sibling modules if they still use old urutan
  await prisma.modul.updateMany({ where: { kodeModul: 'PERALATAN' }, data: { urutan: 6 } });
  await prisma.modul.updateMany({ where: { kodeModul: 'PEMBERITAHUAN' }, data: { urutan: 7 } });
  await prisma.modul.updateMany({ where: { kodeModul: 'PENGATURAN' }, data: { urutan: 8 } });

  console.log('✅ Menu bukti + permissions siap. Logout/login ulang agar sidebar terbarui.');
}

main()
  .catch((e) => {
    console.error('❌ Gagal seed menu bukti:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
