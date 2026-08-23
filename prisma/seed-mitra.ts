/**
 * Standalone seed: Mitra Penyalur (executing partner)
 * Usage: npm run prisma:seed:mitra
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mitraSeed = [
  {
    id: 'mitra-001',
    nama: 'Yayasan Kita Sehat Indonesia',
    bentukLembaga: 'Yayasan',
    noMou: 'MOU/AZ/2025/001',
    masaKerjasama: '01 Jan 2025 - 31 Des 2026',
    picKontak: 'Drs. Hendri',
    hpPic: '081233445566',
    totalPenyaluran: 120000000,
    statusLaporanLpj: 'Terverifikasi',
  },
  {
    id: 'mitra-002',
    nama: 'LKM Syariah Amanah Ummah',
    bentukLembaga: 'LKM Syariah',
    noMou: 'MOU/AZ/2025/004',
    masaKerjasama: '15 Mar 2025 - 15 Mar 2027',
    picKontak: 'Siti Aminah, M.Si',
    hpPic: '081344556677',
    totalPenyaluran: 250000000,
    statusLaporanLpj: 'Menunggu LPJ',
  },
  {
    id: 'mitra-003',
    nama: 'Komunitas Pemuda Relawan Bencana',
    bentukLembaga: 'Komunitas',
    noMou: 'MOU/AZ/2026/002',
    masaKerjasama: '01 Jan 2026 - 31 Des 2026',
    picKontak: 'Fajar Nugraha',
    hpPic: '081555667788',
    totalPenyaluran: 85000000,
    statusLaporanLpj: 'Terverifikasi',
  },
  {
    id: 'mitra-004',
    nama: 'Pesantren Al-Ikhlas Cianjur',
    bentukLembaga: 'Pesantren',
    noMou: 'MOU/AZ/2026/003',
    masaKerjasama: '01 Jun 2026 - 31 Mei 2028',
    picKontak: 'Kyai M. Yusuf, Lc.',
    hpPic: '081766554433',
    totalPenyaluran: 67500000,
    statusLaporanLpj: 'Terverifikasi',
  },
  {
    id: 'mitra-005',
    nama: 'Yayasan Peduli Nusantara',
    bentukLembaga: 'Yayasan',
    noMou: 'MOU/AZ/2026/004',
    masaKerjasama: '15 Feb 2026 - 14 Feb 2027',
    picKontak: 'Dra. Wulan Kartika',
    hpPic: '081899112233',
    totalPenyaluran: 42000000,
    statusLaporanLpj: 'Tertunda',
  },
  {
    id: 'mitra-006',
    nama: 'Komunitas Hijau Peduli',
    bentukLembaga: 'Komunitas',
    noMou: 'MOU/AZ/2026/005',
    masaKerjasama: '01 Apr 2026 - 31 Mar 2027',
    picKontak: 'Rizal Akbar',
    hpPic: '085712345678',
    totalPenyaluran: 18500000,
    statusLaporanLpj: 'Menunggu LPJ',
  },
] as const;

async function main() {
  console.log('🌱 Seeding mitra penyalur...');

  for (const row of mitraSeed) {
    await prisma.mitraPenyalur.upsert({
      where: { id: row.id },
      update: { ...row },
      create: { ...row },
    });
  }

  const count = await prisma.mitraPenyalur.count();
  const terverifikasi = await prisma.mitraPenyalur.count({ where: { statusLaporanLpj: 'Terverifikasi' } });
  const menunggu = await prisma.mitraPenyalur.count({ where: { statusLaporanLpj: 'Menunggu LPJ' } });
  console.log(`✅ Selesai — ${count} mitra (${terverifikasi} LPJ terverifikasi, ${menunggu} menunggu LPJ).`);
}

main()
  .catch((e) => {
    console.error('❌ Gagal seed mitra:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
