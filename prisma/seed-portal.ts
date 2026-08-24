/**
 * Seed dummy Pengajuan Bantuan untuk Portal Publik
 * Usage: npm run prisma:seed:portal
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pengajuanSeed = [
  {
    submissionNumber: 'PB-2026-0715',
    nik: '3204112304890001',
    namaLengkap: 'Siti Rohimah',
    asnafCategory: 'Fakir',
    telepon: '085712345678',
    alamatLengkap: 'Kp. Sukamaju RT 02/04, Desa Ciburuy',
    provinsi: 'Jawa Barat',
    kotaKabupaten: 'Kab. Bandung Barat',
    pekerjaan: 'Buruh Cuci',
    penghasilanBulanan: 650000,
    jumlahTanggungan: 3,
    programBantuanDimohon: 'Bantuan Pangan & Pengobatan Balita',
    estimasiBiayaDibutuhkan: 2500000,
    status: 'Sedang Disurvei',
    stageStatus: 'PROSES_PENGAJUAN',
    tahapanProses: [
      { tahap: 'Formulir Diterima', tanggal: '15 Juli 2026', status: 'Selesai' },
      { tahap: 'Verifikasi Berkas', tanggal: '16 Juli 2026', status: 'Selesai' },
      { tahap: 'Survei Lapangan Amil', tanggal: '18 Juli 2026', status: 'Sedang Berjalan' },
    ],
  },
  {
    submissionNumber: 'PB-2026-0820',
    nik: '3175024503850001',
    namaLengkap: 'Ibu Maryam Binti Usman',
    asnafCategory: 'Fakir',
    telepon: '085811224455',
    alamatLengkap: 'Kampung Melayu, Jatinegara, Jakarta Timur',
    provinsi: 'DKI Jakarta',
    kotaKabupaten: 'Jakarta Timur',
    pekerjaan: 'Janda / Buruh Cuci',
    penghasilanBulanan: 900000,
    jumlahTanggungan: 3,
    programBantuanDimohon: 'Beasiswa Anak Yatim',
    estimasiBiayaDibutuhkan: 4500000,
    status: 'Menunggu Verifikasi',
    stageStatus: 'PROSES_PENGAJUAN',
    tahapanProses: [
      { tahap: 'Formulir Diterima', tanggal: '20 Agustus 2026', status: 'Selesai' },
      { tahap: 'Verifikasi Berkas Amil', tanggal: 'Estimasi 1-2 hari', status: 'Sedang Berjalan' },
    ],
  },
  {
    submissionNumber: 'PB-2026-0812',
    nik: '3204051010920004',
    namaLengkap: 'M. Rizky Ramadhan',
    asnafCategory: 'Miskin',
    telepon: '082133445566',
    alamatLengkap: 'Cileunyi, Kab. Bandung',
    provinsi: 'Jawa Barat',
    kotaKabupaten: 'Kab. Bandung',
    pekerjaan: 'Mahasiswa',
    penghasilanBulanan: 1200000,
    jumlahTanggungan: 1,
    programBantuanDimohon: 'Beasiswa Pendidikan',
    estimasiBiayaDibutuhkan: 8000000,
    status: 'Disetujui Dewan ZIS',
    stageStatus: 'APPROVAL_DEWAN_ZIS',
    tahapanProses: [
      { tahap: 'Formulir Diterima', tanggal: '12 Agustus 2026', status: 'Selesai' },
      { tahap: 'Verifikasi Berkas', tanggal: '13 Agustus 2026', status: 'Selesai' },
      { tahap: 'Survei Lapangan', tanggal: '15 Agustus 2026', status: 'Selesai' },
      { tahap: 'Sidang Dewan ZIS', tanggal: '18 Agustus 2026', status: 'Selesai' },
    ],
  },
  {
    submissionNumber: 'PB-2026-0805',
    nik: '3174090807810006',
    namaLengkap: 'Bpk. Slamet',
    asnafCategory: 'Gharim',
    telepon: '081277889900',
    alamatLengkap: 'Kebayoran Lama, Jakarta Selatan',
    provinsi: 'DKI Jakarta',
    kotaKabupaten: 'Jakarta Selatan',
    pekerjaan: 'Pedagang',
    penghasilanBulanan: 1500000,
    jumlahTanggungan: 5,
    programBantuanDimohon: 'Pelunasan Hutang Darurat',
    estimasiBiayaDibutuhkan: 15000000,
    status: 'Sudah Disalurkan',
    stageStatus: 'SUDAH_DISALURKAN',
    tahapanProses: [
      { tahap: 'Formulir Diterima', tanggal: '5 Agustus 2026', status: 'Selesai' },
      { tahap: 'Verifikasi & Survei', tanggal: '8 Agustus 2026', status: 'Selesai' },
      { tahap: 'Approval Direktur Keuangan', tanggal: '10 Agustus 2026', status: 'Selesai' },
      { tahap: 'Penyaluran Bantuan', tanggal: '14 Agustus 2026', status: 'Selesai' },
    ],
  },
  {
    submissionNumber: 'PB-2026-0728',
    nik: '3671012005780003',
    namaLengkap: 'Bpk. Herman (Mualaf)',
    asnafCategory: 'Mualaf',
    telepon: '087899001122',
    alamatLengkap: 'Cikupa, Tangerang',
    provinsi: 'Banten',
    kotaKabupaten: 'Tangerang',
    pekerjaan: 'Pedagang Kaki Lima',
    penghasilanBulanan: 2100000,
    jumlahTanggungan: 2,
    programBantuanDimohon: 'Modal Usaha Mikro',
    estimasiBiayaDibutuhkan: 5000000,
    status: 'Ditolak',
    stageStatus: 'PROSES_PENGAJUAN',
    surveiNotes: 'Dokumen SKTM tidak valid. Silakan ajukan ulang dengan berkas lengkap.',
    tahapanProses: [
      { tahap: 'Formulir Diterima', tanggal: '28 Juli 2026', status: 'Selesai' },
      { tahap: 'Verifikasi Berkas', tanggal: '30 Juli 2026', status: 'Selesai' },
      { tahap: 'Penolakan — Berkas Tidak Lengkap', tanggal: '1 Agustus 2026', status: 'Selesai' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding Pengajuan Bantuan (Portal Publik)...');
  for (const row of pengajuanSeed) {
    await prisma.pengajuanBantuan.upsert({
      where: { submissionNumber: row.submissionNumber },
      update: row,
      create: row,
    });
  }
  console.log(`✅ Selesai — ${pengajuanSeed.length} pengajuan bantuan di database.`);
}

main()
  .catch((e) => {
    console.error('❌ Gagal seed portal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
