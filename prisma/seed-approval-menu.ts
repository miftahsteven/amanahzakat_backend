import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Tambah menu Approval + permission ke SUPER_ADMIN (tanpa full seed) */
async function main() {
  const modul = await prisma.modul.findUnique({ where: { kodeModul: 'PEMBERITAHUAN' } });
  if (!modul) throw new Error('Modul PEMBERITAHUAN tidak ditemukan');

  const menu = await prisma.menu.upsert({
    where: { kodeMenu: 'approval' },
    update: {
      modulId: modul.id,
      namaMenu: 'Approval Berjenjang Penyaluran',
      kodeTampil: 'AP',
      icon: 'CheckCircle2',
      urutan: 2,
      isActive: true,
    },
    create: {
      modulId: modul.id,
      kodeMenu: 'approval',
      namaMenu: 'Approval Berjenjang Penyaluran',
      kodeTampil: 'AP',
      icon: 'CheckCircle2',
      urutan: 2,
    },
  });

  const actions = [
    { aksi: 'read', nama: 'Lihat Approval Berjenjang' },
    { aksi: 'approve', nama: 'Setujui Pengajuan Penyaluran' },
    { aksi: 'reject', nama: 'Tolak Pengajuan Penyaluran' },
  ] as const;

  const permissionIds: string[] = [];
  for (const action of actions) {
    const kodePermission = `approval.${action.aksi}`;
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

  console.log('✅ Menu approval + permissions seeded for SUPER_ADMIN');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
