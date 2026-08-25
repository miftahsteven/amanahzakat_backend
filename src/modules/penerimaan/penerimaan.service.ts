import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { activeOnly, assertActiveRecord } from '../../lib/soft-delete';
import { buildBszPublicVerifyUrl } from '../../lib/bsz-sign';

type PenerimaanWithMuzakki = Prisma.TransaksiPenerimaanGetPayload<{
  include: { muzakki: true };
}>;

function mapPenerimaanRow(row: PenerimaanWithMuzakki) {
  const status = row.status as 'Terverifikasi' | 'Menunggu Verifikasi' | 'Ditolak';
  return {
    id: row.id,
    noKwitansi: row.noKwitansi,
    noSbmz: row.noSbmz,
    tanggal: row.tanggal,
    muzakkiId: row.muzakkiId,
    muzakkiNama: row.muzakki.nama,
    muzakkiTipe: row.muzakki.tipe as 'Perorangan' | 'Korporat' | 'UPZ',
    jenisZis: row.jenisZis,
    programNama: row.programNama,
    nominal: row.nominal,
    kanal: row.kanal,
    rekeningTujuan: row.rekeningTujuan,
    status,
    catatan: row.catatan,
    /** Signed public URL for BSZ QR (only when verified). */
    verifyUrl: status === 'Terverifikasi' ? buildBszPublicVerifyUrl(row.noKwitansi) : null,
  };
}

function isZakatJenis(jenisZis: string) {
  return jenisZis.toLowerCase().includes('zakat');
}

function computeAlokasi(nominal: number, jenisZis: string) {
  if (!isZakatJenis(jenisZis)) {
    return { hakAmilPct: 0, hakAmil: 0, danaMustahik: nominal, danaMustahikPct: 100 };
  }
  const hakAmilPct = 7.5;
  const hakAmil = Math.round(nominal * (hakAmilPct / 100));
  const danaMustahik = nominal - hakAmil;
  return { hakAmilPct, hakAmil, danaMustahik, danaMustahikPct: 92.5 };
}

function getAkunGl(jenisZis: string) {
  if (jenisZis.includes('Maal')) {
    return { kas: '1011000010 - Kas Bank Zakat', penerimaan: '4011000030 - Penerimaan Zakat Maal' };
  }
  if (jenisZis.includes('Profesi')) {
    return { kas: '1011000010 - Kas Bank Zakat', penerimaan: '4011000031 - Penerimaan Zakat Profesi' };
  }
  if (jenisZis.includes('Fitrah')) {
    return { kas: '1011000012 - Kas Bank Fitrah', penerimaan: '4011000032 - Penerimaan Zakat Fitrah' };
  }
  if (jenisZis === 'Infak') {
    return { kas: '1011000020 - Kas Bank Infak', penerimaan: '4021000010 - Penerimaan Infak' };
  }
  if (jenisZis === 'Shodaqoh') {
    return { kas: '1011000020 - Kas Bank Infak', penerimaan: '4021000020 - Penerimaan Shodaqoh' };
  }
  if (jenisZis.includes('Wakaf')) {
    return { kas: '1011000030 - Kas Bank Wakaf', penerimaan: '4031000010 - Penerimaan Wakaf Uang' };
  }
  return { kas: '1011000010 - Kas Bank Zakat', penerimaan: '4011000030 - Penerimaan ZIS' };
}

function referensiFromId(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `TRF${String(hash % 10_000_000).padStart(7, '0')}`;
}

function formatRiwayatWaktu(date: Date) {
  const d = date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const t = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${d} ${t}`;
}

function addMinutes(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60_000);
}

function buildRiwayat(row: PenerimaanWithMuzakki) {
  const created = new Date(row.createdAt);
  const isVerified = row.status === 'Terverifikasi';
  const isTransfer =
    row.kanal.toLowerCase().includes('transfer') ||
    row.kanal.toLowerCase().includes('bsi') ||
    row.kanal.toLowerCase().includes('bank');

  const steps: Array<{ title: string; desc: string; waktu?: string; done: boolean }> = [
    {
      title: 'Transaksi dicatat',
      desc: 'Input oleh petugas konter/kanal digital',
      waktu: formatRiwayatWaktu(addMinutes(created, 0)),
      done: true,
    },
  ];

  if (isTransfer) {
    steps.push({
      title: 'Mutasi bank teridentifikasi',
      desc: 'Dicocokkan dengan berita transfer',
      waktu: isVerified ? formatRiwayatWaktu(addMinutes(created, 52)) : undefined,
      done: isVerified,
    });
  }

  if (isVerified) {
    steps.push(
      {
        title: 'Verifikasi keuangan',
        desc: 'Disetujui Manajer Keuangan',
        waktu: formatRiwayatWaktu(addMinutes(created, 128)),
        done: true,
      },
      {
        title: 'Posting ke jurnal G/L',
        desc: 'Debit kas, kredit akun penerimaan',
        waktu: formatRiwayatWaktu(addMinutes(created, 129)),
        done: true,
      }
    );
  } else if (row.status === 'Menunggu Verifikasi') {
    steps.push({
      title: 'Menunggu verifikasi keuangan',
      desc: 'Belum disetujui Manajer Keuangan',
      done: false,
    });
  }

  return steps;
}

function mapPenerimaanDetail(row: PenerimaanWithMuzakki) {
  const base = mapPenerimaanRow(row);
  const alokasi = computeAlokasi(row.nominal, row.jenisZis);
  const akun = getAkunGl(row.jenisZis);
  const seq = row.noKwitansi.split('/').pop()?.padStart(3, '0') ?? '001';
  const noTransaksi = `ZIS-${row.tanggal.slice(2).replace(/-/g, '')}-${seq}`;

  return {
    ...base,
    noTransaksi,
    muzakkiNomor: row.muzakki.nomor,
    muzakkiNikNpwp: row.muzakki.nikAtauNpwp,
    muzakkiTotalSetoran: row.muzakki.totalSetoran,
    ...alokasi,
    referensiBank: referensiFromId(row.id),
    jurnalGl: [
      { akun: akun.kas, debit: row.nominal, kredit: 0 },
      { akun: akun.penerimaan, debit: 0, kredit: row.nominal },
    ],
    riwayat: buildRiwayat(row),
  };
}

export class PenerimaanService {
  static async list(jenisZis?: string) {
    const rows = await prisma.transaksiPenerimaan.findMany({
      where: jenisZis && jenisZis !== 'Semua' ? { jenisZis } : undefined,
      include: { muzakki: true },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map(mapPenerimaanRow);
  }

  static async getById(id: string) {
    const row = await prisma.transaksiPenerimaan.findUnique({
      where: { id },
      include: { muzakki: true },
    });
    if (!row) throw { statusCode: 404, message: 'Transaksi penerimaan tidak ditemukan.' };
    return mapPenerimaanDetail(row);
  }

  static async listMuzakki() {
    return prisma.muzakki.findMany({
      where: activeOnly,
      orderBy: { nama: 'asc' },
      select: {
        id: true,
        nomor: true,
        nama: true,
        tipe: true,
        nikAtauNpwp: true,
        hp: true,
        email: true,
        alamat: true,
        totalSetoran: true,
        transaksiCount: true,
        tanggalBergabung: true,
      },
    });
  }

  static async create(input: {
    muzakkiId: string;
    jenisZis: string;
    nominal: number;
    kanal: string;
    rekeningTujuan?: string;
    catatan?: string;
    programNama?: string;
  }) {
    const muzakki = await prisma.muzakki.findUnique({ where: { id: input.muzakkiId } });
    assertActiveRecord(muzakki, 'Muzakki');

    const immediateKanal = ['Cash / Konter', 'Payroll UPZ'];
    const isImmediate = immediateKanal.includes(input.kanal);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const seq = Math.floor(1000 + Math.random() * 9000);
    const noKwitansi = isImmediate
      ? `KWT/${year}/${month}/${seq}`
      : `KWT-PENDING/${year}/${month}/${seq}`;
    const status = isImmediate ? 'Terverifikasi' : 'Menunggu Verifikasi';

    const trx = await prisma.transaksiPenerimaan.create({
      data: {
        noKwitansi,
        tanggal: now.toISOString().slice(0, 10),
        muzakkiId: input.muzakkiId,
        jenisZis: input.jenisZis,
        programNama: input.programNama,
        nominal: input.nominal,
        kanal: input.kanal,
        rekeningTujuan: input.rekeningTujuan || 'BSI 7001234567 (Zakat Maal)',
        status,
        catatan: input.catatan,
        noSbmz: isImmediate
          ? `SBMZ/${year}/${month}/ASK${Math.floor(100000 + Math.random() * 900000)}`
          : undefined,
      },
      include: { muzakki: true },
    });

    if (isImmediate) {
      await prisma.muzakki.update({
        where: { id: muzakki.id },
        data: {
          totalSetoran: { increment: input.nominal },
          transaksiCount: { increment: 1 },
        },
      });
    }

    return mapPenerimaanRow(trx);
  }

  static async update(
    id: string,
    input: {
      muzakkiId?: string;
      jenisZis?: string;
      nominal?: number;
      kanal?: string;
      rekeningTujuan?: string;
      catatan?: string;
      programNama?: string;
    },
  ) {
    const existing = await prisma.transaksiPenerimaan.findUnique({
      where: { id },
      include: { muzakki: true },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Transaksi penerimaan tidak ditemukan.' };
    }

    if (existing.status !== 'Menunggu Verifikasi') {
      throw {
        statusCode: 400,
        message: 'Hanya transaksi berstatus Menunggu Verifikasi yang dapat diubah.',
      };
    }

    if (input.muzakkiId) {
      const muzakki = await prisma.muzakki.findUnique({ where: { id: input.muzakkiId } });
      assertActiveRecord(muzakki, 'Muzakki');
    }

    const updated = await prisma.transaksiPenerimaan.update({
      where: { id },
      data: {
        muzakkiId: input.muzakkiId ?? existing.muzakkiId,
        jenisZis: input.jenisZis ?? existing.jenisZis,
        nominal: input.nominal ?? existing.nominal,
        kanal: input.kanal ?? existing.kanal,
        rekeningTujuan: input.rekeningTujuan ?? existing.rekeningTujuan,
        catatan: input.catatan !== undefined ? input.catatan : existing.catatan,
        programNama: input.programNama !== undefined ? input.programNama : existing.programNama,
      },
      include: { muzakki: true },
    });

    return mapPenerimaanRow(updated);
  }

  static async remove(id: string) {
    const existing = await prisma.transaksiPenerimaan.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Transaksi penerimaan tidak ditemukan.' };
    }

    if (existing.status !== 'Menunggu Verifikasi') {
      throw {
        statusCode: 400,
        message: 'Hanya transaksi berstatus Menunggu Verifikasi yang dapat dihapus.',
      };
    }

    await prisma.transaksiPenerimaan.delete({ where: { id } });
    return { id };
  }

  static async verify(id: string) {
    const existing = await prisma.transaksiPenerimaan.findUnique({
      where: { id },
      include: { muzakki: true },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Transaksi penerimaan tidak ditemukan.' };
    }

    if (existing.status === 'Terverifikasi') {
      return mapPenerimaanRow(existing);
    }

    const noKwitansi =
      existing.noKwitansi.startsWith('KWT-PENDING/')
        ? `KWT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`
        : existing.noKwitansi;

    const updated = await prisma.transaksiPenerimaan.update({
      where: { id },
      data: {
        status: 'Terverifikasi',
        noKwitansi,
        noSbmz:
          existing.noSbmz ||
          `SBMZ/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/ASK${Math.floor(100000 + Math.random() * 900000)}`,
      },
      include: { muzakki: true },
    });

    if (existing.status === 'Menunggu Verifikasi') {
      await prisma.muzakki.update({
        where: { id: updated.muzakkiId },
        data: {
          totalSetoran: { increment: updated.nominal },
          transaksiCount: { increment: 1 },
        },
      });
    }

    return mapPenerimaanRow(updated);
  }
}
