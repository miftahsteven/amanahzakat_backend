import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type MenuSeed = {
  kodeModul: string;
  kodeMenu: string;
  namaMenu: string;
  kodeTampil: string;
  icon?: string;
  urutan: number;
  tampilDiSidebar?: boolean;
  tampilDiHeader?: boolean;
  actions: { aksi: string; nama: string }[];
};

const modulesData = [
  { kodeModul: 'IKHTISAR', namaModul: 'IKHTISAR', urutan: 1 },
  { kodeModul: 'OPERASIONAL_ZIS', namaModul: 'OPERASIONAL ZIS', urutan: 2 },
  { kodeModul: 'KEUANGAN', namaModul: 'KEUANGAN & AKUNTANSI', urutan: 3 },
  { kodeModul: 'PERALATAN', namaModul: 'PERALATAN', urutan: 4 },
  { kodeModul: 'PEMBERITAHUAN', namaModul: 'PEMBERITAHUAN', urutan: 5 },
  { kodeModul: 'PENGATURAN', namaModul: 'PENGATURAN SISTEM', urutan: 6 },
];

const read = (nama: string) => [{ aksi: 'read', nama }];

const menusData: MenuSeed[] = [
  { kodeModul: 'IKHTISAR', kodeMenu: 'dashboard', namaMenu: 'Dashboard ERP', kodeTampil: 'DB', icon: 'LayoutDashboard', urutan: 1, actions: read('Lihat Dashboard') },
  { kodeModul: 'IKHTISAR', kodeMenu: 'laporan', namaMenu: 'Laporan Distribusi', kodeTampil: 'LD', icon: 'FileBarChart', urutan: 2, actions: [...read('Lihat Laporan Distribusi'), { aksi: 'export', nama: 'Ekspor Laporan Distribusi' }] },
  { kodeModul: 'IKHTISAR', kodeMenu: 'peta', namaMenu: 'Peta Sebaran Mustahik', kodeTampil: 'PT', icon: 'Map', urutan: 3, actions: read('Lihat Peta Sebaran') },
  { kodeModul: 'IKHTISAR', kodeMenu: 'dampak', namaMenu: 'Dampak Publik', kodeTampil: 'DP', icon: 'HeartHandshake', urutan: 4, actions: read('Lihat Dampak Publik') },

  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'penerimaan', namaMenu: 'Penerimaan ZIS & Kwitansi', kodeTampil: 'PN', icon: 'Wallet', urutan: 1, actions: [...read('Lihat Penerimaan ZIS'), { aksi: 'create', nama: 'Catat Penerimaan ZIS' }, { aksi: 'update', nama: 'Ubah Penerimaan ZIS' }, { aksi: 'delete', nama: 'Hapus Penerimaan ZIS' }, { aksi: 'verify', nama: 'Verifikasi Penerimaan ZIS' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'penyaluran', namaMenu: 'Penyaluran 8 Asnaf', kodeTampil: 'PY', icon: 'HandCoins', urutan: 2, actions: [...read('Lihat Penyaluran'), { aksi: 'create', nama: 'Ajukan Penyaluran' }, { aksi: 'update', nama: 'Ubah Penyaluran' }, { aksi: 'delete', nama: 'Hapus Penyaluran' }, { aksi: 'verify', nama: 'Verifikasi / Cairkan Penyaluran' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'muzakki', namaMenu: 'Data Muzakki', kodeTampil: 'MZ', icon: 'Users', urutan: 3, actions: [...read('Lihat Data Muzakki'), { aksi: 'create', nama: 'Tambah Muzakki' }, { aksi: 'update', nama: 'Ubah Muzakki' }, { aksi: 'delete', nama: 'Hapus Muzakki' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'program', namaMenu: 'Program & Pagu Anggaran', kodeTampil: 'PR', icon: 'FolderKanban', urutan: 4, actions: [...read('Lihat Program ZIS'), { aksi: 'update', nama: 'Ubah Program & Pagu' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'mitra', namaMenu: 'Dashboard Mitra Penyalur', kodeTampil: 'MT', icon: 'Building2', urutan: 5, actions: [...read('Lihat Mitra Penyalur'), { aksi: 'create', nama: 'Tambah Mitra' }, { aksi: 'update', nama: 'Ubah Mitra' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'portalUpz', namaMenu: 'Portal UPZ Korporat', kodeTampil: 'PU', icon: 'Globe2', urutan: 6, actions: read('Akses Portal UPZ Korporat') },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'upz', namaMenu: 'Dashboard UPZ Cabang', kodeTampil: 'UP', icon: 'Landmark', urutan: 7, actions: [...read('Lihat Dashboard UPZ'), { aksi: 'update', nama: 'Ubah Data UPZ' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'payroll', namaMenu: 'Payroll UPZ', kodeTampil: 'PL', icon: 'Banknote', urutan: 8, actions: [...read('Lihat Payroll UPZ'), { aksi: 'update', nama: 'Proses Payroll UPZ' }] },
  { kodeModul: 'OPERASIONAL_ZIS', kodeMenu: 'mustahik', namaMenu: 'Data Mustahik & Scoring', kodeTampil: 'MS', icon: 'UserRoundSearch', urutan: 9, actions: [...read('Lihat Data Mustahik'), { aksi: 'create', nama: 'Tambah Mustahik' }, { aksi: 'update', nama: 'Ubah Mustahik' }, { aksi: 'delete', nama: 'Hapus Mustahik' }] },

  { kodeModul: 'KEUANGAN', kodeMenu: 'jurnal', namaMenu: 'Pencatatan Jurnal & G/L PSAK 109', kodeTampil: 'JR', icon: 'BookOpen', urutan: 1, actions: [...read('Lihat Jurnal & G/L'), { aksi: 'create', nama: 'Catat Jurnal' }] },
  { kodeModul: 'KEUANGAN', kodeMenu: 'closing', namaMenu: 'Closing Periode Akuntansi', kodeTampil: 'CL', icon: 'Lock', urutan: 2, actions: [...read('Lihat Closing Periode'), { aksi: 'execute', nama: 'Eksekusi Closing Periode' }] },
  { kodeModul: 'KEUANGAN', kodeMenu: 'simba', namaMenu: 'Export Paket SIMBA BAZNAS', kodeTampil: 'SB', icon: 'Package', urutan: 3, actions: [...read('Lihat Export SIMBA'), { aksi: 'export', nama: 'Ekspor Paket SIMBA' }] },

  { kodeModul: 'PERALATAN', kodeMenu: 'kalkulator', namaMenu: 'Kalkulator Zakat Maal/Fitrah', kodeTampil: 'KL', icon: 'Calculator', urutan: 1, actions: read('Gunakan Kalkulator ZIS') },
  { kodeModul: 'PERALATAN', kodeMenu: 'portal', namaMenu: 'Portal Informasi Publik', kodeTampil: 'PO', icon: 'Info', urutan: 2, actions: read('Akses Portal Publik') },

  { kodeModul: 'PEMBERITAHUAN', kodeMenu: 'inbox', namaMenu: 'Pesan & Inbox Notifikasi', kodeTampil: 'IB', icon: 'Bell', urutan: 1, tampilDiSidebar: false, tampilDiHeader: true, actions: read('Lihat Inbox & Notifikasi') },

  { kodeModul: 'PENGATURAN', kodeMenu: 'user-management', namaMenu: 'Manajemen Pengguna (CRUD)', kodeTampil: 'UM', icon: 'UserCog', urutan: 1, actions: [...read('Lihat Manajemen Pengguna'), { aksi: 'manage', nama: 'Kelola Pengguna' }] },
  { kodeModul: 'PENGATURAN', kodeMenu: 'module-management', namaMenu: 'Manajemen Modul & Menu', kodeTampil: 'MM', icon: 'Layers', urutan: 2, actions: [...read('Lihat Manajemen Modul'), { aksi: 'manage', nama: 'Kelola Modul & Menu' }] },
  { kodeModul: 'PENGATURAN', kodeMenu: 'permission-management', namaMenu: 'Manajemen Permission', kodeTampil: 'PM', icon: 'KeyRound', urutan: 3, actions: [...read('Lihat Manajemen Permission'), { aksi: 'manage', nama: 'Kelola Permission' }] },
  { kodeModul: 'PENGATURAN', kodeMenu: 'acl-management', namaMenu: 'ACL & Role Menu Management', kodeTampil: 'AM', icon: 'ShieldCheck', urutan: 4, actions: [...read('Lihat ACL & Role'), { aksi: 'manage', nama: 'Kelola ACL & Role' }] },
];

const verifikatorPermissionCodes = [
  'dashboard.read',
  'laporan.read',
  'laporan.export',
  'penerimaan.read',
  'penerimaan.verify',
  'penyaluran.read',
  'penyaluran.verify',
  'mustahik.read',
  'jurnal.read',
  'jurnal.create',
  'closing.read',
  'closing.execute',
  'simba.read',
  'simba.export',
  'inbox.read',
];

const amilPermissionCodes = [
  'dashboard.read',
  'penerimaan.read',
  'penerimaan.create',
  'penerimaan.update',
  'muzakki.read',
  'muzakki.create',
  'muzakki.update',
  'mustahik.read',
  'mustahik.create',
  'mustahik.update',
  'kalkulator.read',
  'inbox.read',
];

async function assignPermissionCodes(roleId: string, codes: string[], permissionMap: Map<string, string>) {
  const rows = codes
    .map((code) => {
      const permissionId = permissionMap.get(code);
      if (!permissionId) {
        console.warn(`⚠️  Permission ${code} tidak ditemukan, dilewati.`);
        return null;
      }
      return { roleId, permissionId };
    })
    .filter((row): row is { roleId: string; permissionId: string } => row !== null);

  if (rows.length === 0) return;

  await prisma.rolePermission.createMany({
    data: rows,
    skipDuplicates: true,
  });
}

async function main() {
  console.log('🌱 Seeding Amanah Zakat: modul, menu, permission, role, user...');

  const moduleMap = new Map<string, string>();
  for (const modul of modulesData) {
    const saved = await prisma.modul.upsert({
      where: { kodeModul: modul.kodeModul },
      update: {
        namaModul: modul.namaModul,
        urutan: modul.urutan,
        isActive: true,
      },
      create: modul,
    });
    moduleMap.set(modul.kodeModul, saved.id);
  }
  console.log(`✅ ${moduleMap.size} modul`);

  const menuMap = new Map<string, string>();
  for (const menu of menusData) {
    const modulId = moduleMap.get(menu.kodeModul);
    if (!modulId) {
      throw new Error(`Modul ${menu.kodeModul} tidak ditemukan untuk menu ${menu.kodeMenu}`);
    }

    const saved = await prisma.menu.upsert({
      where: { kodeMenu: menu.kodeMenu },
      update: {
        modulId,
        namaMenu: menu.namaMenu,
        kodeTampil: menu.kodeTampil,
        icon: menu.icon ?? null,
        urutan: menu.urutan,
        tampilDiSidebar: menu.tampilDiSidebar ?? true,
        tampilDiHeader: menu.tampilDiHeader ?? false,
        isActive: true,
      },
      create: {
        modulId,
        kodeMenu: menu.kodeMenu,
        namaMenu: menu.namaMenu,
        kodeTampil: menu.kodeTampil,
        icon: menu.icon ?? null,
        urutan: menu.urutan,
        tampilDiSidebar: menu.tampilDiSidebar ?? true,
        tampilDiHeader: menu.tampilDiHeader ?? false,
      },
    });
    menuMap.set(menu.kodeMenu, saved.id);
  }
  console.log(`✅ ${menuMap.size} menu (dengan icon)`);

  const permissionMap = new Map<string, string>();
  for (const menu of menusData) {
    const menuId = menuMap.get(menu.kodeMenu);
    if (!menuId) continue;

    for (const action of menu.actions) {
      const kodePermission = `${menu.kodeMenu}.${action.aksi}`;
      const saved = await prisma.permission.upsert({
        where: { kodePermission },
        update: {
          namaPermission: action.nama,
          aksi: action.aksi,
          menuId,
        },
        create: {
          kodePermission,
          namaPermission: action.nama,
          aksi: action.aksi,
          menuId,
        },
      });
      permissionMap.set(kodePermission, saved.id);
    }
  }
  console.log(`✅ ${permissionMap.size} permission`);

  const superAdminRole = await prisma.role.upsert({
    where: { kodeRole: 'SUPER_ADMIN' },
    update: {
      namaRole: 'Super Admin System',
      deskripsi: 'Akses penuh ke seluruh modul, menu, dan pengaturan sistem Amanah Zakat ERP',
      isSystem: true,
    },
    create: {
      kodeRole: 'SUPER_ADMIN',
      namaRole: 'Super Admin System',
      deskripsi: 'Akses penuh ke seluruh modul, menu, dan pengaturan sistem Amanah Zakat ERP',
      isSystem: true,
    },
  });

  const verifikatorRole = await prisma.role.upsert({
    where: { kodeRole: 'VERIFIKATOR' },
    update: {
      namaRole: 'Verifikator Keuangan & Penyaluran',
      deskripsi: 'Memverifikasi transaksi masuk, penyaluran, laporan, mustahik, dan jurnal G/L',
      isSystem: true,
    },
    create: {
      kodeRole: 'VERIFIKATOR',
      namaRole: 'Verifikator Keuangan & Penyaluran',
      deskripsi: 'Memverifikasi transaksi masuk, penyaluran, laporan, mustahik, dan jurnal G/L',
      isSystem: true,
    },
  });

  const amilRole = await prisma.role.upsert({
    where: { kodeRole: 'AMIL' },
    update: {
      namaRole: 'Staf Amil Operasional ZIS',
      deskripsi: 'Staf operasional pencatatan ZIS, muzakki, mustahik, dan kalkulator ZIS',
      isSystem: true,
    },
    create: {
      kodeRole: 'AMIL',
      namaRole: 'Staf Amil Operasional ZIS',
      deskripsi: 'Staf operasional pencatatan ZIS, muzakki, mustahik, dan kalkulator ZIS',
      isSystem: true,
    },
  });

  await prisma.rolePermission.deleteMany({
    where: {
      roleId: { in: [superAdminRole.id, verifikatorRole.id, amilRole.id] },
    },
  });

  await assignPermissionCodes(superAdminRole.id, Array.from(permissionMap.keys()), permissionMap);
  await assignPermissionCodes(verifikatorRole.id, verifikatorPermissionCodes, permissionMap);
  await assignPermissionCodes(amilRole.id, amilPermissionCodes, permissionMap);
  console.log('✅ Mapping permission ke SUPER_ADMIN, VERIFIKATOR, AMIL');

  const passwordHash = await bcrypt.hash('password123', 10);
  const superAdminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash, isActive: true, isOtpVerified: true },
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

  console.log('✅ Super Admin: admin / password123');
  console.log('🎉 Seeding selesai.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
