import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { detectWilayahNama } from '../../lib/geocode';
import { ApprovalService } from '../approval/approval.service';

type PenyaluranRow = Prisma.TransaksiPenyaluranGetPayload<{
  include: { mustahik: true; program: true };
}>;

function mapRow(row: PenyaluranRow) {
  return {
    id: row.id,
    noPenyaluran: row.noPenyaluran,
    tanggal: row.tanggal,
    mustahikId: row.mustahikId,
    mustahikNama: row.mustahik.nama,
    asnaf: row.asnaf,
    programId: row.programId,
    programNama: row.program.nama,
    nominal: row.nominal,
    status: row.status,
    metodePembayaran: row.metodePembayaran,
    rekeningTujuan: row.rekeningTujuan,
    keterangan: row.keterangan,
    potonganAmil: row.potonganAmil,
    danaMustahik: row.danaMustahik,
  };
}

function referensiFromId(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `TRF${String(hash % 10_000_000_000).padStart(9, '0').slice(0, 9)}`;
}

function formatRiwayatWaktu(date: Date) {
  const d = date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return d;
}

async function mapPenyaluranDetail(row: PenyaluranRow) {
  const base = mapRow(row);
  const tersalur = row.status === 'Sudah Tersalurkan';
  const seq = row.noPenyaluran.split('/').pop()?.padStart(3, '0') ?? '001';
  const noTransaksi = `PYL-${row.tanggal.slice(2).replace(/-/g, '')}-${seq}`;

  const [mitra, mustahikPenyaluran, approval] = await Promise.all([
    prisma.mitraPenyalur.findFirst({ orderBy: { totalPenyaluran: 'desc' } }),
    prisma.transaksiPenyaluran.findMany({
      where: { mustahikId: row.mustahikId, status: 'Sudah Tersalurkan' },
      include: { program: true },
      orderBy: { tanggal: 'desc' },
      take: 10,
    }),
    prisma.approvalPengajuan.findFirst({
      where: { penyaluranId: row.id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const programSet = [...new Set(mustahikPenyaluran.map((p) => p.program.nama))];
  const porsiPaguPct =
    row.program.paguAnggaran > 0 ? Math.round((row.nominal / row.program.paguAnggaran) * 100) : 0;

  const created = new Date(row.createdAt);
  const tgl = formatRiwayatWaktu(created);
  const approvalDone = approval?.status === 'Disetujui' || tersalur;
  const approvalRejected = approval?.status === 'Ditolak' || row.status === 'Ditolak';

  return {
    ...base,
    noTransaksi,
    mustahikNik: row.mustahik.nik,
    mustahikWilayah: detectWilayahNama(row.mustahik.alamat),
    mustahikTotalBantuan: row.mustahik.totalBantuanDiterima,
    mustahikRiwayatProgram: programSet.length ? programSet.join(' · ') : row.program.nama,
    programPagu: row.program.paguAnggaran,
    programTerpakai: row.program.terpakai,
    programPenanggungJawab: row.program.penanggungJawab,
    porsiPaguPct,
    mitraNama: mitra?.nama ?? 'Dilaksanakan internal amil',
    mitraPic: mitra ? `${mitra.picKontak} · ${mitra.bentukLembaga}` : 'Divisi program pusat',
    akunDebit: `5011000010 — Penyaluran Asnaf ${row.asnaf}`,
    akunKredit: '1011000010 — Kas Bank Zakat',
    refTransfer: tersalur ? referensiFromId(row.id) : 'Belum ada referensi',
    dokumen: [
      { nama: 'Formulir permohonan bantuan', status: 'Lengkap' },
      { nama: 'Fotokopi KTP / KK penerima', status: 'Lengkap' },
      { nama: 'Berita acara survei kelayakan', status: 'Lengkap' },
      { nama: 'Bukti serah terima dana', status: tersalur ? 'Lengkap' : 'Menunggu' },
    ],
    riwayat: [
      { title: 'Pengajuan diterima', desc: 'Proposal / usulan tercatat di sistem', waktu: tgl, done: true },
      { title: 'Survei & verifikasi kelayakan', desc: 'Divisi program memvalidasi data mustahik', waktu: tgl, done: true },
      {
        title: 'Approval anggaran',
        desc: approvalRejected
          ? 'Pengajuan ditolak pada alur berjenjang'
          : approval?.status === 'Menunggu'
            ? `Menunggu tahap ${approval.tahap === 1 ? 'Maker' : approval.tahap === 2 ? 'Checker' : 'Approver'}`
            : 'Dicek terhadap pagu program',
        waktu: approvalDone || approvalRejected ? tgl : undefined,
        done: approvalDone || approvalRejected,
      },
      {
        title: 'Pencairan dana',
        desc: tersalur ? 'Transfer berhasil ke penerima' : 'Menunggu eksekusi pembayaran',
        waktu: tersalur ? tgl : undefined,
        done: tersalur,
      },
      {
        title: 'Laporan pemanfaatan',
        desc: 'Monitoring dampak oleh mitra / amil',
        waktu: tersalur ? 'Dijadwalkan' : undefined,
        done: false,
      },
    ],
  };
}

async function fetchRows(asnaf?: string) {
  return prisma.transaksiPenyaluran.findMany({
    where:
      asnaf && asnaf !== 'Semua'
        ? { asnaf: { equals: asnaf, mode: 'insensitive' } }
        : undefined,
    include: { mustahik: true, program: true },
    orderBy: { createdAt: 'desc' },
  });
}

export class PenyaluranService {
  static async list(asnaf?: string) {
    const rows = await fetchRows(asnaf);
    return rows.map(mapRow);
  }

  static async getById(id: string) {
    const row = await prisma.transaksiPenyaluran.findUnique({
      where: { id },
      include: { mustahik: true, program: true },
    });
    if (!row) throw { statusCode: 404, message: 'Transaksi penyaluran tidak ditemukan.' };
    return mapPenyaluranDetail(row);
  }

  static async listMustahik() {
    return prisma.mustahik.findMany({
      where: { statusSurvei: 'Terverifikasi' },
      orderBy: { nama: 'asc' },
      select: {
        id: true,
        nik: true,
        nama: true,
        kategoriAsnaf: true,
        hp: true,
        alamat: true,
        pekerjaan: true,
        jumlahTanggungan: true,
        penghasilanBulanan: true,
        rekeningBank: true,
        statusSurvei: true,
        skorKelayakan: true,
        totalBantuanDiterima: true,
      },
    });
  }

  static async listProgram() {
    return prisma.programZis.findMany({
      where: { status: 'Berjalan' },
      orderBy: { nama: 'asc' },
      select: {
        id: true,
        nama: true,
        pilar: true,
        paguAnggaran: true,
        terpakai: true,
        targetPenerima: true,
        realisasiPenerima: true,
        status: true,
        penanggungJawab: true,
      },
    });
  }

  static async create(input: {
    mustahikId: string;
    programId: string;
    asnaf: string;
    nominal: number;
    metodePembayaran: string;
    keterangan: string;
    pengaju?: string;
  }) {
    const [mustahik, program] = await Promise.all([
      prisma.mustahik.findUnique({ where: { id: input.mustahikId } }),
      prisma.programZis.findFirst({
        where: { id: input.programId, status: { not: 'Dihapus' } },
      }),
    ]);

    if (!mustahik) {
      throw { statusCode: 404, message: 'Mustahik tidak ditemukan.' };
    }
    if (!program) {
      throw { statusCode: 404, message: 'Program ZIS tidak ditemukan.' };
    }

    const potonganAmil = Math.round(input.nominal * 0.075);
    const danaMustahik = input.nominal - potonganAmil;
    const now = new Date();
    const noPenyaluran = `SLR/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`;

    const trx = await prisma.transaksiPenyaluran.create({
      data: {
        noPenyaluran,
        tanggal: now.toISOString().slice(0, 10),
        mustahikId: input.mustahikId,
        asnaf: input.asnaf,
        programId: input.programId,
        nominal: input.nominal,
        status: 'Menunggu Approval',
        metodePembayaran: input.metodePembayaran,
        rekeningTujuan: mustahik.rekeningBank,
        keterangan: input.keterangan,
        potonganAmil,
        danaMustahik,
      },
      include: { mustahik: true, program: true },
    });

    await ApprovalService.createFromPenyaluran({
      penyaluranId: trx.id,
      noPenyaluran: trx.noPenyaluran,
      perihal: `${input.keterangan} — ${mustahik.nama} (${input.asnaf})`,
      nominal: input.nominal,
      pengaju: input.pengaju ?? 'Amil',
    });

    return mapRow(trx);
  }

  static async disburse(id: string) {
    const existing = await prisma.transaksiPenyaluran.findUnique({
      where: { id },
      include: { mustahik: true, program: true },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Transaksi penyaluran tidak ditemukan.' };
    }

    if (existing.status === 'Sudah Tersalurkan') {
      return mapPenyaluranDetail(existing);
    }

    if (existing.status === 'Menunggu Approval') {
      throw { statusCode: 400, message: 'Penyaluran masih menunggu approval berjenjang.' };
    }

    if (existing.status === 'Ditolak') {
      throw { statusCode: 400, message: 'Penyaluran ditolak dan tidak dapat dicairkan.' };
    }

    if (existing.status !== 'Siap Bayar') {
      throw { statusCode: 400, message: 'Status penyaluran tidak memungkinkan pencairan.' };
    }

    const pendingApproval = await prisma.approvalPengajuan.findFirst({
      where: { penyaluranId: id, status: 'Menunggu' },
    });
    if (pendingApproval) {
      throw { statusCode: 400, message: 'Penyaluran masih menunggu approval berjenjang.' };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.transaksiPenyaluran.update({
        where: { id },
        data: { status: 'Sudah Tersalurkan' },
        include: { mustahik: true, program: true },
      });

      await tx.mustahik.update({
        where: { id: row.mustahikId },
        data: {
          totalBantuanDiterima: { increment: row.danaMustahik },
        },
      });

      await tx.programZis.update({
        where: { id: row.programId },
        data: {
          terpakai: { increment: row.nominal },
          realisasiPenerima: { increment: 1 },
        },
      });

      return row;
    });

    return mapPenyaluranDetail(updated);
  }
}
