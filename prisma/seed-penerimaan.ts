/**
 * Seed dummy TransaksiPenerimaan + Muzakki only (safe to re-run).
 * Usage: npx ts-node-dev --transpile-only --no-notify prisma/seed-penerimaan.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const muzakkiSeed = [
  { nomor: 'MZK-2026-00001', nama: 'PT Telkom Indonesia (CSR)', tipe: 'Korporat', nikAtauNpwp: '01.001.001.1-012.000', hp: '0218800000', email: 'csr@telkom.co.id', alamat: 'Jl. Japati No. 1, Bandung', totalSetoran: 150000000, transaksiCount: 3, tanggalBergabung: '3 Januari 2024' },
  { nomor: 'MZK-2026-00002', nama: 'H. Ahmad Fauzi, S.E.', tipe: 'Perorangan', nikAtauNpwp: '32.123.456.7-012.000', hp: '08111222333', email: 'ahmad.fauzi@example.com', alamat: 'Jl. Sudirman No. 88, Jakarta Selatan', totalSetoran: 37500000, transaksiCount: 5, tanggalBergabung: '12 Februari 2025' },
  { nomor: 'MZK-2026-00003', nama: 'UPZ PT Paragon Technology', tipe: 'UPZ', nikAtauNpwp: '02.345.678.9-012.000', hp: '02177889900', email: 'upz@paragoncorp.com', alamat: 'Tangerang, Banten', totalSetoran: 95000000, transaksiCount: 4, tanggalBergabung: '20 Maret 2024' },
  { nomor: 'MZK-2026-00004', nama: 'Hj. Siti Rahmawati', tipe: 'Perorangan', nikAtauNpwp: '36.987.654.3-012.000', hp: '082233445566', email: 'siti.rahmawati@example.com', alamat: 'Surabaya, Jawa Timur', totalSetoran: 28000000, transaksiCount: 6, tanggalBergabung: '5 April 2025' },
  { nomor: 'MZK-2026-00005', nama: 'Bpk. Hendra Wijaya', tipe: 'Perorangan', nikAtauNpwp: '31.555.444.3-012.000', hp: '081398765432', email: 'hendra.wijaya@example.com', alamat: 'Depok, Jawa Barat', totalSetoran: 12250000, transaksiCount: 2, tanggalBergabung: '18 Juni 2025' },
  { nomor: 'MZK-2026-0819', nama: 'H. Ahmad Dahlan, S.E.', tipe: 'Perorangan', nikAtauNpwp: '01.234.567.8-012.000', hp: '081234567890', email: 'ahmad.dahlan@example.com', alamat: 'Jl. Menteng Raya No. 42, Jakarta Pusat', totalSetoran: 27500000, transaksiCount: 7, tanggalBergabung: '10 Januari 2025' },
  { nomor: 'MZK-2026-00006', nama: 'CV Berkah Sejahtera', tipe: 'Korporat', nikAtauNpwp: '02.111.222.3-012.000', hp: '02155667788', email: 'finance@berkahsejahtera.co.id', alamat: 'Bekasi, Jawa Barat', totalSetoran: 45000000, transaksiCount: 2, tanggalBergabung: '1 Juli 2025' },
];

const penerimaanSeed = [
  { noKwitansi: 'KWT/2026/08/001', noSbmz: 'SBMZ/2026/08/ASK001001', tanggal: '2026-08-01', muzakkiNomor: 'MZK-2026-00001', jenisZis: 'Zakat Maal', programNama: 'Zakat perusahaan Triwulan III', nominal: 150000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001234567 (Zakat Maal)', status: 'Terverifikasi', catatan: 'Zakat perusahaan Triwulan III' },
  { noKwitansi: 'KWT/2026/08/002', noSbmz: 'SBMZ/2026/08/ASK001002', tanggal: '2026-08-02', muzakkiNomor: 'MZK-2026-00002', jenisZis: 'Zakat Profesi', programNama: 'Zakat penghasilan Agustus 2026', nominal: 12500000, kanal: 'QRIS', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Setoran zakat penghasilan bulan Agustus' },
  { noKwitansi: 'KWT/2026/08/003', noSbmz: 'SBMZ/2026/08/ASK001003', tanggal: '2026-08-03', muzakkiNomor: 'MZK-2026-00003', jenisZis: 'Infak', programNama: 'Program Beasiswa Anak Yatim', nominal: 35000000, kanal: 'Payroll UPZ', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak terikat program beasiswa' },
  { noKwitansi: 'KWT/2026/08/004', noSbmz: 'SBMZ/2026/08/ASK001004', tanggal: '2026-08-05', muzakkiNomor: 'MZK-2026-00004', jenisZis: 'Shodaqoh', programNama: 'Pembangunan Sumur Bersih', nominal: 10000000, kanal: 'Cash / Konter', rekeningTujuan: 'Kasir Konter Utama', status: 'Terverifikasi', catatan: 'Shodaqoh pembangunan sumur bersih' },
  { noKwitansi: 'KWT/2026/08/005', noSbmz: null, tanggal: '2026-08-07', muzakkiNomor: 'MZK-2026-00005', jenisZis: 'Zakat Fitrah', programNama: 'Zakat Fitrah 50 Jiwa', nominal: 2250000, kanal: 'QRIS', rekeningTujuan: 'BSI 7003456789 (Zakat Fitrah)', status: 'Menunggu Verifikasi', catatan: 'Zakat fitrah 50 jiwa karyawan' },
  { noKwitansi: 'KWT/2026/08/006', noSbmz: 'SBMZ/2026/08/ASK001006', tanggal: '2026-08-08', muzakkiNomor: 'MZK-2026-0819', jenisZis: 'Zakat Maal', programNama: 'Zakat Harta Simpanan', nominal: 12500000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001-ZAKAT-MAAL', status: 'Terverifikasi', catatan: 'Pembayaran zakat maal via web publik' },
  { noKwitansi: 'KWT/2026/08/007', noSbmz: 'SBMZ/2026/08/ASK001007', tanggal: '2026-08-10', muzakkiNomor: 'MZK-2026-00006', jenisZis: 'Wakaf Uang', programNama: 'Wakaf Produktif UMKM', nominal: 50000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7004567890 (Wakaf Uang)', status: 'Terverifikasi', catatan: 'Wakaf produktif untuk UMKM dhuafa' },
  { noKwitansi: 'KWT/2026/08/008', noSbmz: null, tanggal: '2026-08-12', muzakkiNomor: 'MZK-2026-00002', jenisZis: 'Infak', programNama: 'Bantuan Korban Bencana', nominal: 5000000, kanal: 'Marketplace', rekeningTujuan: 'Rekening Infak Operasional', status: 'Menunggu Verifikasi', catatan: 'Donasi infak via marketplace resmi' },
  { noKwitansi: 'KWT/2026/08/009', noSbmz: 'SBMZ/2026/08/ASK001009', tanggal: '2026-08-14', muzakkiNomor: 'MZK-2026-00004', jenisZis: 'Zakat Profesi', programNama: 'Zakat Profesi Juli 2026', nominal: 8750000, kanal: 'QRIS', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Zakat profesi rutin bulanan' },
  { noKwitansi: 'KWT/2026/08/010', noSbmz: 'SBMZ/2026/08/ASK001010', tanggal: '2026-08-16', muzakkiNomor: 'MZK-2026-00001', jenisZis: 'Infak', programNama: 'Operasional Tanggap Darurat', nominal: 25000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak CSR tanggap darurat' },
  { noKwitansi: 'KWT/2026/08/011', noSbmz: null, tanggal: '2026-08-18', muzakkiNomor: 'MZK-2026-00003', jenisZis: 'Shodaqoh', programNama: 'Paket Pangan Ramadhan', nominal: 15000000, kanal: 'Payroll UPZ', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Menunggu Verifikasi', catatan: 'Potongan shodaqoh karyawan UPZ' },
  { noKwitansi: 'KWT/2026/07/014', noSbmz: 'SBMZ/2026/07/ASK004182', tanggal: '2026-07-26', muzakkiNomor: 'MZK-2026-0819', jenisZis: 'Zakat Maal', programNama: 'Zakat Harta Simpanan', nominal: 12500000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001-ZAKAT-MAAL', status: 'Terverifikasi', catatan: 'Pembayaran zakat maal periode Juli' },
];

async function main() {
  console.log('🌱 Seeding dummy Muzakki & Transaksi Penerimaan...');

  const muzakkiMap = new Map<string, string>();
  for (const m of muzakkiSeed) {
    const saved = await prisma.muzakki.upsert({
      where: { nomor: m.nomor },
      update: {
        nama: m.nama,
        tipe: m.tipe,
        nikAtauNpwp: m.nikAtauNpwp,
        hp: m.hp,
        email: m.email,
        alamat: m.alamat,
        totalSetoran: m.totalSetoran,
        transaksiCount: m.transaksiCount,
      },
      create: { ...m },
    });
    muzakkiMap.set(m.nomor, saved.id);
  }

  for (const row of penerimaanSeed) {
    const muzakkiId = muzakkiMap.get(row.muzakkiNomor);
    if (!muzakkiId) continue;

    await prisma.transaksiPenerimaan.upsert({
      where: { noKwitansi: row.noKwitansi },
      update: {
        noSbmz: row.noSbmz,
        tanggal: row.tanggal,
        muzakkiId,
        jenisZis: row.jenisZis,
        programNama: row.programNama,
        nominal: row.nominal,
        kanal: row.kanal,
        rekeningTujuan: row.rekeningTujuan,
        status: row.status,
        catatan: row.catatan,
      },
      create: {
        noKwitansi: row.noKwitansi,
        noSbmz: row.noSbmz,
        tanggal: row.tanggal,
        muzakkiId,
        jenisZis: row.jenisZis,
        programNama: row.programNama,
        nominal: row.nominal,
        kanal: row.kanal,
        rekeningTujuan: row.rekeningTujuan,
        status: row.status,
        catatan: row.catatan,
      },
    });
  }

  const count = await prisma.transaksiPenerimaan.count();
  console.log(`✅ Selesai — ${count} transaksi penerimaan di database.`);
}

main()
  .catch((e) => {
    console.error('❌ Gagal seed penerimaan:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
