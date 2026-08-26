/**
 * Seed Keuangan (CoA, Jurnal, SIMBA), Inbox, Closing, Approval
 * Usage: npm run prisma:seed:keuangan
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const coaSeed = [
  { kode: '101100', nama: 'Kas Kecil Amil', tipe: 'Aset', grup: 'AKTIFA', saldo: 15000000 },
  { kode: '101201', nama: 'Bank BSI Penampung Zakat', tipe: 'Aset', grup: 'AKTIFA', saldo: 450000000 },
  { kode: '101202', nama: 'Bank BSI Penampung Infak', tipe: 'Aset', grup: 'AKTIFA', saldo: 185000000 },
  { kode: '301100', nama: 'Dana Zakat (Saldo Kelolaan)', tipe: 'Dana Zakat', grup: 'PENDIRIAN', saldo: 450000000 },
  { kode: '302100', nama: 'Dana Infak / Sedekah', tipe: 'Dana Infak', grup: 'PENDIRIAN', saldo: 185000000 },
  { kode: '303100', nama: 'Dana Hak Amil (12.5%)', tipe: 'Dana Amil', grup: 'PENDIRIAN', saldo: 65000000 },
  { kode: '401100', nama: 'Penerimaan Zakat Maal', tipe: 'Penerimaan', grup: 'PENERIMAAN', saldo: 850000000 },
  { kode: '401200', nama: 'Penerimaan Zakat Profesi', tipe: 'Penerimaan', grup: 'PENERIMAAN', saldo: 420000000 },
  { kode: '501100', nama: 'Penyaluran Zakat Fakir Miskin', tipe: 'Penyaluran', grup: 'PENYALURAN', saldo: 520000000 },
  { kode: '501200', nama: 'Penyaluran Zakat Fisabilillah', tipe: 'Penyaluran', grup: 'PENYALURAN', saldo: 210000000 },
  { kode: '601100', nama: 'Beban Operasional Gaji Amil', tipe: 'Beban Amil', grup: 'BEBAN', saldo: 145000000 },
];

const jurnalSeed = [
  { noJurnal: 'JRN/2026/08/001', tanggal: '2026-08-01', keterangan: 'Penerimaan Zakat Maal PT Telkom Indonesia', debitKode: '101201', debitNama: 'Bank BSI Penampung Zakat', kreditKode: '401100', kreditNama: 'Penerimaan Zakat Maal', nominal: 150000000, status: 'Posted' },
  { noJurnal: 'JRN/2026/08/002', tanggal: '2026-08-02', keterangan: 'Penyaluran Zakat Fisabilillah Ustadz Ahmad', debitKode: '501200', debitNama: 'Penyaluran Zakat Fisabilillah', kreditKode: '101201', kreditNama: 'Bank BSI Penampung Zakat', nominal: 5000000, status: 'Posted' },
  { noJurnal: 'JRN/2026/08/003', tanggal: '2026-08-03', keterangan: 'Alokasi Hak Amil 12.5% dari Zakat Maal', debitKode: '401100', debitNama: 'Penerimaan Zakat Maal', kreditKode: '303100', kreditNama: 'Dana Hak Amil (12.5%)', nominal: 18750000, status: 'Posted' },
  { noJurnal: 'JRN/2026/07/001', tanggal: '2026-07-05', keterangan: 'Penerimaan Zakat Maal korporat Juli', debitKode: '101201', debitNama: 'Bank BSI Penampung Zakat', kreditKode: '401100', kreditNama: 'Penerimaan Zakat Maal', nominal: 50000000, status: 'Posted' },
  { noJurnal: 'JRN/2026/07/002', tanggal: '2026-07-18', keterangan: 'Infak program beasiswa Juli', debitKode: '101202', debitNama: 'Bank BSI Penampung Infak', kreditKode: '302100', kreditNama: 'Dana Infak / Sedekah', nominal: 35000000, status: 'Posted' },
];

const simbaSeed = [
  { kodeForm: 'HAL_2_PENGUMPULAN', namaForm: 'Hal 2 - Pengumpulan', status: 'Siap Kirim', itemCount: 0, totalNilai: 0 },
  { kodeForm: 'HAL_3_MUZAKI', namaForm: 'Hal 3 - Muzaki', status: 'Siap Kirim', itemCount: 0, totalNilai: 0 },
  { kodeForm: 'HAL_4_PENYALURAN', namaForm: 'Hal 4 - Penyaluran', status: 'Siap Kirim', itemCount: 0, totalNilai: 0 },
  { kodeForm: 'HAL_5_MUSTAHIK', namaForm: 'Hal 5 - Mustahik', status: 'Siap Kirim', itemCount: 0, totalNilai: 0 },
  { kodeForm: 'HAL_6_TATA_KELOLA', namaForm: 'Hal 6 - Tata Kelola', status: 'Draft', itemCount: 0, totalNilai: 0 },
  { kodeForm: 'HAL_7_OFF_BALANCE', namaForm: 'Hal 7 - Off Balance Sheet', status: 'Draft', itemCount: 0, totalNilai: 0 },
  { kodeForm: 'HAL_8_DUKUNGAN_PEMDA', namaForm: 'Hal 8 - Dukungan Pemerintah', status: 'Draft', itemCount: 0, totalNilai: 0 },
];

const notifikasiSeed = [
  { judul: 'Pengajuan Penyaluran Baru', pesan: 'Proposal pelunasan hutang darurat Bpk. Slamet memerlukan approval.', kategori: 'Approval', linkScreen: 'penyaluran', dibaca: false },
  { judul: 'Penerimaan QRIS Terverifikasi', pesan: 'Setoran zakat profesi Rp 12.500.000 H. Ahmad Fauzi telah diverifikasi.', kategori: 'Penerimaan', linkScreen: 'penerimaan', dibaca: false },
  { judul: 'LPJ Mitra Terunggah', pesan: 'Yayasan Kita Sehat Indonesia mengunggah LPJ penyaluran kesehatan.', kategori: 'System', linkScreen: 'mitra', dibaca: true },
  { judul: 'Pengingat Tutup Buku', pesan: 'Periode berjalan siap dikunci setelah verifikasi 4 langkah pra-tutup.', kategori: 'Closing', linkScreen: 'closing', dibaca: true },
];

const approvalSeed = [
  { ref: 'PYL-260726-021', perihal: 'Penyaluran Program Dakwah — Ustadz Ahmad', nominal: 18500000, pengaju: 'Ust. Nur Hidayat', tahap: 1, tipe: 'penyaluran' },
  { ref: 'PYL-260726-020', perihal: 'Bantuan Pangan Keluarga — Ibu Maryam', nominal: 4200000, pengaju: 'Drs. H. M. Ridwan', tahap: 2, tipe: 'penyaluran' },
  { ref: 'AML-2026-0042', perihal: 'Operasional Amil Agustus', nominal: 18500000, pengaju: 'Rina Permata, S.Ak', tahap: 1, tipe: 'operasional' },
  { ref: 'PYL-250726-019', perihal: 'Wakaf Sumur Sumba Timur', nominal: 96000000, pengaju: 'Bambang Sugipto', tahap: 2, tipe: 'penyaluran' },
];

async function main() {
  console.log('🌱 Seeding Keuangan, Inbox, Closing, Approval...');

  for (const row of coaSeed) {
    await prisma.accountCoA.upsert({
      where: { kode: row.kode },
      update: { nama: row.nama, tipe: row.tipe, grup: row.grup, saldo: row.saldo },
      create: row,
    });
  }

  for (const row of jurnalSeed) {
    await prisma.jurnalEntry.upsert({
      where: { noJurnal: row.noJurnal },
      update: row,
      create: row,
    });
  }

  for (const row of simbaSeed) {
    await prisma.formSimba.upsert({
      where: { kodeForm: row.kodeForm },
      update: { namaForm: row.namaForm, status: row.status },
      create: row,
    });
  }

  const now = new Date();
  const periode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  await prisma.closingPeriode.upsert({
    where: { periode },
    update: {},
    create: {
      periode,
      label: `${bulan[now.getMonth()]} ${now.getFullYear()}`,
      stepRekon: true,
      stepJurnal: true,
    },
  });

  for (const row of notifikasiSeed) {
    const exists = await prisma.notifikasi.findFirst({ where: { judul: row.judul, pesan: row.pesan } });
    if (!exists) await prisma.notifikasi.create({ data: row });
  }

  for (const row of approvalSeed) {
    await prisma.approvalPengajuan.upsert({
      where: { ref: row.ref },
      update: { perihal: row.perihal, nominal: row.nominal, pengaju: row.pengaju, tahap: row.tahap, status: 'Menunggu' },
      create: { ...row, status: 'Menunggu' },
    });
  }

  console.log('✅ Selesai — CoA, Jurnal, SIMBA, Notifikasi, Closing, Approval di database.');
}

main()
  .catch((e) => {
    console.error('❌ Gagal seed keuangan:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
