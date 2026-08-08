import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Amanah Zakat ERP Database Seeder with Full Menu ACL...');

  // 1. All System Menu Permissions
  const permissionsData = [
    // Ikhtisar
    { kodePermission: 'menu.dashboard', namaPermission: 'Akses Menu Dashboard', modul: 'IKHTISAR' },
    { kodePermission: 'menu.laporan', namaPermission: 'Akses Menu Laporan Distribusi', modul: 'IKHTISAR' },
    { kodePermission: 'menu.peta', namaPermission: 'Akses Menu Peta Sebaran', modul: 'IKHTISAR' },
    { kodePermission: 'menu.dampak', namaPermission: 'Akses Menu Dampak Publik', modul: 'IKHTISAR' },
    // Operasional ZIS
    { kodePermission: 'menu.penerimaan', namaPermission: 'Akses Menu Penerimaan ZIS', modul: 'OPERASIONAL ZIS' },
    { kodePermission: 'menu.penyaluran', namaPermission: 'Akses Menu Penyaluran ZIS', modul: 'OPERASIONAL ZIS' },
    { kodePermission: 'menu.muzakki', namaPermission: 'Akses Menu Data Muzakki', modul: 'OPERASIONAL ZIS' },
    { kodePermission: 'menu.program', namaPermission: 'Akses Menu Program & Anggaran', modul: 'OPERASIONAL ZIS' },
    { kodePermission: 'menu.mitra', namaPermission: 'Akses Menu Dashboard Mitra', modul: 'OPERASIONAL ZIS' },
    { kodePermission: 'menu.portalUpz', namaPermission: 'Akses Menu Portal UPZ Korporat', modul: 'OPERASIONAL ZIS' },
    { kodePermission: 'menu.upz', namaPermission: 'Akses Menu Dashboard UPZ', modul: 'OPERASIONAL ZIS' },
    { kodePermission: 'menu.payroll', namaPermission: 'Akses Menu Payroll UPZ', modul: 'OPERASIONAL ZIS' },
    { kodePermission: 'menu.mustahik', namaPermission: 'Akses Menu Data Mustahik', modul: 'OPERASIONAL ZIS' },
    // Keuangan & Akuntansi
    { kodePermission: 'menu.jurnal', namaPermission: 'Akses Menu Jurnal & G/L', modul: 'KEUANGAN' },
    { kodePermission: 'menu.closing', namaPermission: 'Akses Menu Closing Periode', modul: 'KEUANGAN' },
    { kodePermission: 'menu.simba', namaPermission: 'Akses Menu Export SIMBA BAZNAS', modul: 'KEUANGAN' },
    // Peralatan & Notifikasi
    { kodePermission: 'menu.kalkulator', namaPermission: 'Akses Menu Kalkulator ZIS', modul: 'PERALATAN' },
    { kodePermission: 'menu.portal', namaPermission: 'Akses Menu Portal Publik', modul: 'PERALATAN' },
    { kodePermission: 'menu.inbox', namaPermission: 'Akses Menu Inbox & Notifikasi', modul: 'PEMBERITAHUAN' },
    // Pengaturan Sistem & ACL
    { kodePermission: 'menu.user-management', namaPermission: 'Akses Menu Manajemen Pengguna', modul: 'PENGATURAN' },
    { kodePermission: 'menu.acl-management', namaPermission: 'Akses Menu ACL & Role Management', modul: 'PENGATURAN' },
  ];

  const permissionsMap = new Map<string, any>();
  for (const perm of permissionsData) {
    const created = await prisma.permission.upsert({
      where: { kodePermission: perm.kodePermission },
      update: perm,
      create: perm,
    });
    permissionsMap.set(perm.kodePermission, created);
  }
  console.log(`✅ Seeded ${permissionsMap.size} Menu & Action Permissions.`);

  // 2. Create Roles
  const superAdminRole = await prisma.role.upsert({
    where: { kodeRole: 'SUPER_ADMIN' },
    update: {
      namaRole: 'Super Admin System',
      deskripsi: 'Akses penuh ke seluruh 21 modul/menu dan pengaturan sistem Amanah Zakat ERP',
      isSystem: true,
    },
    create: {
      kodeRole: 'SUPER_ADMIN',
      namaRole: 'Super Admin System',
      deskripsi: 'Akses penuh ke seluruh 21 modul/menu dan pengaturan sistem Amanah Zakat ERP',
      isSystem: true,
    },
  });

  const verifikatorRole = await prisma.role.upsert({
    where: { kodeRole: 'VERIFIKATOR' },
    update: {
      namaRole: 'Verifikator Keuangan & Penyaluran',
      deskripsi: 'Akses memverifikasi transaksi masuk, penyaluran, Laporan, Mustahik, dan Jurnal G/L',
      isSystem: true,
    },
    create: {
      kodeRole: 'VERIFIKATOR',
      namaRole: 'Verifikator Keuangan & Penyaluran',
      deskripsi: 'Akses memverifikasi transaksi masuk, penyaluran, Laporan, Mustahik, dan Jurnal G/L',
      isSystem: true,
    },
  });

  const amilRole = await prisma.role.upsert({
    where: { kodeRole: 'AMIL' },
    update: {
      namaRole: 'Staf Amil Operasional ZIS',
      deskripsi: 'Staf operasional pencatatan ZIS, Muzakki, Mustahik, dan Kalkulator ZIS',
      isSystem: true,
    },
    create: {
      kodeRole: 'AMIL',
      namaRole: 'Staf Amil Operasional ZIS',
      deskripsi: 'Staf operasional pencatatan ZIS, Muzakki, Mustahik, dan Kalkulator ZIS',
      isSystem: true,
    },
  });

  console.log('✅ Seeded Default Roles (SUPER_ADMIN, VERIFIKATOR, AMIL).');

  // Assign ALL permissions to SUPER_ADMIN
  for (const perm of permissionsMap.values()) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Assign Verifikator Permissions
  const verifikatorCodes = ['menu.dashboard', 'menu.laporan', 'menu.penerimaan', 'menu.penyaluran', 'menu.mustahik', 'menu.jurnal', 'menu.closing', 'menu.inbox'];
  for (const code of verifikatorCodes) {
    const perm = permissionsMap.get(code);
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: verifikatorRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: verifikatorRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // Assign Amil Permissions
  const amilCodes = ['menu.dashboard', 'menu.penerimaan', 'menu.muzakki', 'menu.mustahik', 'menu.kalkulator', 'menu.inbox'];
  for (const code of amilCodes) {
    const perm = permissionsMap.get(code);
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: amilRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: amilRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  console.log('✅ Mapped Menu Permissions to SUPER_ADMIN (All 21 menus), VERIFIKATOR, and AMIL.');

  // 3. Create Super Admin User (admin / password123)
  const passwordHash = await bcrypt.hash('password123', 10);
  const superAdminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash, isActive: true },
    create: {
      username: 'admin',
      email: 'admin@amanahzakat.or.id',
      passwordHash,
      namaLengkap: 'Yoga Riai Hamzah (Super Admin)',
      nomorHp: '081234567890',
      nip: 'AML-2026-001',
      isActive: true,
      isOtpVerified: true,
    },
  });

  // Assign SUPER_ADMIN role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  });

  console.log('✅ Super Admin User Created:');
  console.log('   Username: admin');
  console.log('   Email   : admin@amanahzakat.or.id');
  console.log('   Password: password123');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
