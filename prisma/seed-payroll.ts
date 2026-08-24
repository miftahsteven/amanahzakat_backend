/**
 * Standalone seed: Amil Karyawan / Payroll
 * Usage: npm run prisma:seed:payroll
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const amilSeed = [
  {
    id: 'amil-001',
    nip: 'AML-001',
    nama: 'Ahmad Syarif, S.E.I',
    jabatan: 'Direktur Eksekutif',
    divisi: 'SDM & Umum',
    gajiPokok: 15000000,
    tunjanganAmil: 3500000,
    potonganZakat: 462500,
    keikutsertaanPayroll: true,
    statusKerja: 'Tetap',
  },
  {
    id: 'amil-002',
    nip: 'AML-002',
    nama: 'Rina Permata, S.Ak',
    jabatan: 'Kepala Divisi Keuangan & Akuntansi',
    divisi: 'Keuangan & Akuntansi',
    gajiPokok: 10500000,
    tunjanganAmil: 2200000,
    potonganZakat: 317500,
    keikutsertaanPayroll: true,
    statusKerja: 'Tetap',
  },
  {
    id: 'amil-003',
    nip: 'AML-003',
    nama: 'Ust. Nur Hidayat, M.Ag',
    jabatan: 'Kepala Divisi Program & Penyaluran',
    divisi: 'Penyaluran & Program',
    gajiPokok: 11000000,
    tunjanganAmil: 2500000,
    potonganZakat: 337500,
    keikutsertaanPayroll: true,
    statusKerja: 'Tetap',
  },
  {
    id: 'amil-004',
    nip: 'AML-004',
    nama: 'Dedi Kurniawan',
    jabatan: 'Staf Penghimpunan & Fundraising',
    divisi: 'Penghimpunan',
    gajiPokok: 6500000,
    tunjanganAmil: 1200000,
    potonganZakat: 192500,
    keikutsertaanPayroll: true,
    statusKerja: 'Tetap',
  },
  {
    id: 'amil-005',
    nip: 'AML-005',
    nama: 'Siti Aminah, S.Sos',
    jabatan: 'Staf Survei Mustahik',
    divisi: 'Penyaluran & Program',
    gajiPokok: 5500000,
    tunjanganAmil: 900000,
    potonganZakat: 160000,
    keikutsertaanPayroll: true,
    statusKerja: 'Kontrak',
  },
  {
    id: 'amil-006',
    nip: 'AML-006',
    nama: 'Budi Santoso',
    jabatan: 'Kasir Konter Penerimaan',
    divisi: 'Keuangan & Akuntansi',
    gajiPokok: 4800000,
    tunjanganAmil: 750000,
    potonganZakat: 138750,
    keikutsertaanPayroll: true,
    statusKerja: 'Tetap',
  },
  {
    id: 'amil-007',
    nip: 'AML-007',
    nama: 'Fajar Nugraha',
    jabatan: 'Relawan Lapangan Bencana',
    divisi: 'Penyaluran & Program',
    gajiPokok: 0,
    tunjanganAmil: 500000,
    potonganZakat: 12500,
    keikutsertaanPayroll: false,
    statusKerja: 'Relawan',
  },
  {
    id: 'amil-008',
    nip: 'AML-008',
    nama: 'Lestari Wulandari, S.Kom',
    jabatan: 'Staf Digital Fundraising',
    divisi: 'Penghimpunan',
    gajiPokok: 7200000,
    tunjanganAmil: 1100000,
    potonganZakat: 207500,
    keikutsertaanPayroll: true,
    statusKerja: 'Kontrak',
  },
] as const;

async function main() {
  console.log('🌱 Seeding amil karyawan / payroll...');

  for (const row of amilSeed) {
    await prisma.amilKaryawan.upsert({
      where: { id: row.id },
      update: { ...row },
      create: { ...row },
    });
  }

  const count = await prisma.amilKaryawan.count();
  const payroll = await prisma.amilKaryawan.count({ where: { keikutsertaanPayroll: true } });
  console.log(`✅ Selesai — ${count} amil (${payroll} ikut payroll).`);
}

main()
  .catch((e) => {
    console.error('❌ Gagal seed payroll:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
