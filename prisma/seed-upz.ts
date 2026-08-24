/**
 * Standalone seed: UPZ Cabang
 * Usage: npm run prisma:seed:upz
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const upzSeed = [
  {
    id: 'upz-001',
    kodeUpz: 'UPZ-01',
    nama: 'UPZ Masjid Agung Al-Azhar',
    kategori: 'Masjid',
    totalPenghimpunan: 185000000,
    totalPenyaluran: 160000000,
    hakPengelolaanPct: 10,
    statusKepatuhan: 'Patuh',
  },
  {
    id: 'upz-002',
    kodeUpz: 'UPZ-02',
    nama: 'UPZ Kementerian Pertanian RI',
    kategori: 'Instansi Pemerintah',
    totalPenghimpunan: 420000000,
    totalPenyaluran: 380000000,
    hakPengelolaanPct: 12.5,
    statusKepatuhan: 'Patuh',
  },
  {
    id: 'upz-003',
    kodeUpz: 'UPZ-03',
    nama: 'UPZ PT Bio Farma (Persero)',
    kategori: 'BUMN / Korporat',
    totalPenghimpunan: 290000000,
    totalPenyaluran: 250000000,
    hakPengelolaanPct: 10,
    statusKepatuhan: 'Perlu Audit',
  },
  {
    id: 'upz-004',
    kodeUpz: 'UPZ-04',
    nama: 'UPZ Universitas Padjadjaran',
    kategori: 'Sekolah / Kampus',
    totalPenghimpunan: 98000000,
    totalPenyaluran: 82000000,
    hakPengelolaanPct: 10,
    statusKepatuhan: 'Patuh',
  },
  {
    id: 'upz-005',
    kodeUpz: 'UPZ-05',
    nama: 'UPZ Masjid Istiqlal Jakarta',
    kategori: 'Masjid',
    totalPenghimpunan: 512000000,
    totalPenyaluran: 445000000,
    hakPengelolaanPct: 8,
    statusKepatuhan: 'Patuh',
  },
  {
    id: 'upz-006',
    kodeUpz: 'UPZ-06',
    nama: 'UPZ PT Telkom Indonesia',
    kategori: 'BUMN / Korporat',
    totalPenghimpunan: 175000000,
    totalPenyaluran: 140000000,
    hakPengelolaanPct: 10,
    statusKepatuhan: 'Baru',
  },
  {
    id: 'upz-007',
    kodeUpz: 'UPZ-07',
    nama: 'UPZ Pemda Kabupaten Bandung',
    kategori: 'Instansi Pemerintah',
    totalPenghimpunan: 68000000,
    totalPenyaluran: 45000000,
    hakPengelolaanPct: 12.5,
    statusKepatuhan: 'Perlu Audit',
  },
  {
    id: 'upz-008',
    kodeUpz: 'UPZ-08',
    nama: 'UPZ SMA Plus Al-Azhar Bandung',
    kategori: 'Sekolah / Kampus',
    totalPenghimpunan: 32000000,
    totalPenyaluran: 18000000,
    hakPengelolaanPct: 10,
    statusKepatuhan: 'Baru',
  },
] as const;

async function main() {
  console.log('🌱 Seeding UPZ cabang...');

  for (const row of upzSeed) {
    await prisma.upzCabang.upsert({
      where: { id: row.id },
      update: { ...row },
      create: { ...row },
    });
  }

  const count = await prisma.upzCabang.count();
  const patuh = await prisma.upzCabang.count({ where: { statusKepatuhan: 'Patuh' } });
  const perluAudit = await prisma.upzCabang.count({ where: { statusKepatuhan: 'Perlu Audit' } });
  console.log(`✅ Selesai — ${count} UPZ (${patuh} patuh, ${perluAudit} perlu audit).`);
}

main()
  .catch((e) => {
    console.error('❌ Gagal seed UPZ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
