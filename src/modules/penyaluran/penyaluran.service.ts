import { prisma } from '../../lib/prisma';

function mapRow(row: Awaited<ReturnType<typeof fetchRows>>[number]) {
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
    status: row.status as 'Siap Bayar' | 'Sudah Tersalurkan',
    metodePembayaran: row.metodePembayaran,
    rekeningTujuan: row.rekeningTujuan,
    keterangan: row.keterangan,
    potonganAmil: row.potonganAmil,
    danaMustahik: row.danaMustahik,
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
    return mapRow(row);
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
  }) {
    const [mustahik, program] = await Promise.all([
      prisma.mustahik.findUnique({ where: { id: input.mustahikId } }),
      prisma.programZis.findUnique({ where: { id: input.programId } }),
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
        status: 'Siap Bayar',
        metodePembayaran: input.metodePembayaran,
        rekeningTujuan: mustahik.rekeningBank,
        keterangan: input.keterangan,
        potonganAmil,
        danaMustahik,
      },
      include: { mustahik: true, program: true },
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
      return mapRow(existing);
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

    return mapRow(updated);
  }
}
