import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pages = [
  { kodeForm: 'HAL_2_PENGUMPULAN', namaForm: 'Hal 2 - Pengumpulan', status: 'Siap Kirim' },
  { kodeForm: 'HAL_3_MUZAKI', namaForm: 'Hal 3 - Muzaki', status: 'Siap Kirim' },
  { kodeForm: 'HAL_4_PENYALURAN', namaForm: 'Hal 4 - Penyaluran', status: 'Siap Kirim' },
  { kodeForm: 'HAL_5_MUSTAHIK', namaForm: 'Hal 5 - Mustahik', status: 'Siap Kirim' },
  { kodeForm: 'HAL_6_TATA_KELOLA', namaForm: 'Hal 6 - Tata Kelola', status: 'Draft' },
  { kodeForm: 'HAL_7_OFF_BALANCE', namaForm: 'Hal 7 - Off Balance Sheet', status: 'Draft' },
  { kodeForm: 'HAL_8_DUKUNGAN_PEMDA', namaForm: 'Hal 8 - Dukungan Pemerintah', status: 'Draft' },
];

async function main() {
  console.log('🌱 Seeding form SIMBA Hal 2–8...');
  for (const row of pages) {
    await prisma.formSimba.upsert({
      where: { kodeForm: row.kodeForm },
      update: { namaForm: row.namaForm, status: row.status },
      create: { ...row, itemCount: 0, totalNilai: 0 },
    });
  }

  // Update menu label if exists
  await prisma.menu.updateMany({
    where: { kodeMenu: 'simba' },
    data: { namaMenu: 'Entri Bulanan SIMBA BAZNAS' },
  });

  console.log('✅ Form SIMBA Lapkin siap.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
