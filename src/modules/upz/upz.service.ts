import { prisma } from '../../lib/prisma';

const upzSelect = {
  id: true,
  kodeUpz: true,
  nama: true,
  kategori: true,
  totalPenghimpunan: true,
  totalPenyaluran: true,
  hakPengelolaanPct: true,
  statusKepatuhan: true,
} as const;

async function generateKodeUpz(): Promise<string> {
  const latest = await prisma.upzCabang.findMany({
    where: { kodeUpz: { startsWith: 'UPZ-' } },
    orderBy: { kodeUpz: 'desc' },
    take: 50,
  });

  let maxSeq = 0;
  for (const row of latest) {
    const match = row.kodeUpz.match(/^UPZ-(\d+)$/);
    if (match) {
      maxSeq = Math.max(maxSeq, parseInt(match[1], 10));
    }
  }

  return `UPZ-${String(maxSeq + 1).padStart(2, '0')}`;
}

export class UpzService {
  static async list(kategori?: string, statusKepatuhan?: string) {
    const where: Record<string, unknown> = {};
    if (kategori && kategori !== 'Semua') {
      where.kategori = { equals: kategori, mode: 'insensitive' };
    }
    if (statusKepatuhan && statusKepatuhan !== 'Semua') {
      where.statusKepatuhan = { equals: statusKepatuhan, mode: 'insensitive' };
    }

    return prisma.upzCabang.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: [{ totalPenghimpunan: 'desc' }, { kodeUpz: 'asc' }],
      select: upzSelect,
    });
  }

  static async getById(id: string) {
    const row = await prisma.upzCabang.findUnique({ where: { id }, select: upzSelect });
    if (!row) throw { statusCode: 404, message: 'UPZ cabang tidak ditemukan.' };

    const [programs, payrollMuzakki, payrollTrx] = await Promise.all([
      prisma.programZis.findMany({
        where: { status: 'Berjalan' },
        orderBy: { terpakai: 'desc' },
        take: 6,
        select: {
          id: true,
          nama: true,
          penanggungJawab: true,
          paguAnggaran: true,
          terpakai: true,
        },
      }),
      prisma.muzakki.findMany({
        where: { tipe: 'UPZ' },
        orderBy: { totalSetoran: 'desc' },
        take: 8,
        select: { id: true, nomor: true, nama: true, totalSetoran: true, transaksiCount: true },
      }),
      prisma.transaksiPenerimaan.findMany({
        where: {
          kanal: { contains: 'Payroll UPZ', mode: 'insensitive' },
          status: 'Terverifikasi',
        },
        include: { muzakki: { select: { nama: true } } },
        orderBy: { tanggal: 'desc' },
        take: 10,
      }),
    ]);

    const terkumpul = row.totalPenghimpunan;
    const tersalur = row.totalPenyaluran;
    const pct = terkumpul > 0 ? Math.round((tersalur / terkumpul) * 100) : 0;
    const hakUpzPct = row.hakPengelolaanPct;
    const hakAmilPct = 7.5;
    const infrastrukturPct = 2;
    const danaMustahikPct = Math.max(0, 100 - hakAmilPct - hakUpzPct - infrastrukturPct);

    const inisial = row.nama
      .replace(/^UPZ\s+/i, '')
      .split(' ')
      .filter((w) => w.length > 0)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

    return {
      ...row,
      inisial,
      pctSalur: pct,
      danaBelumTersalur: Math.max(0, terkumpul - tersalur),
      sharing: [
        { label: 'Hak Amil AmanahZakat', pct: hakAmilPct, value: Math.round(terkumpul * (hakAmilPct / 100)) },
        { label: 'Hak Pengelolaan UPZ', pct: hakUpzPct, value: Math.round(terkumpul * (hakUpzPct / 100)) },
        {
          label: 'Biaya Sistem & Infrastruktur',
          pct: infrastrukturPct,
          value: Math.round(terkumpul * (infrastrukturPct / 100)),
        },
        {
          label: 'Dana Mustahik Bersih',
          pct: danaMustahikPct,
          value: Math.round(terkumpul * (danaMustahikPct / 100)),
        },
      ],
      programRows: programs.map((p) => ({
        id: p.id,
        nama: p.nama,
        pj: p.penanggungJawab,
        pagu: p.paguAnggaran,
        terpakai: p.terpakai,
        pct: p.paguAnggaran > 0 ? Math.min(100, Math.round((p.terpakai / p.paguAnggaran) * 100)) : 0,
      })),
      muzakkiUpz: payrollMuzakki,
      recentPayroll: payrollTrx.map((p) => ({
        id: p.id,
        tanggal: p.tanggal,
        muzakki: p.muzakki.nama,
        jenisZis: p.jenisZis,
        nominal: p.nominal,
        noKwitansi: p.noKwitansi,
      })),
    };
  }

  static async create(input: {
    nama: string;
    kategori: string;
    hakPengelolaanPct?: number;
    totalPenghimpunan?: number;
    totalPenyaluran?: number;
    statusKepatuhan?: string;
  }) {
    const kodeUpz = await generateKodeUpz();

    return prisma.upzCabang.create({
      data: {
        kodeUpz,
        nama: input.nama,
        kategori: input.kategori,
        hakPengelolaanPct: input.hakPengelolaanPct ?? 10,
        totalPenghimpunan: input.totalPenghimpunan ?? 0,
        totalPenyaluran: input.totalPenyaluran ?? 0,
        statusKepatuhan: input.statusKepatuhan ?? 'Baru',
      },
      select: upzSelect,
    });
  }

  static async portalSummary() {
    const [upzKorporat, muzakkiUpz, penerimaanPayroll] = await Promise.all([
      prisma.upzCabang.findMany({
        where: { kategori: { contains: 'Korporat', mode: 'insensitive' } },
        orderBy: { totalPenghimpunan: 'desc' },
        select: upzSelect,
      }),
      prisma.muzakki.findMany({
        where: { tipe: 'UPZ' },
        orderBy: { totalSetoran: 'desc' },
      }),
      prisma.transaksiPenerimaan.findMany({
        where: {
          kanal: { contains: 'Payroll UPZ', mode: 'insensitive' },
          status: 'Terverifikasi',
        },
        include: { muzakki: true },
        orderBy: { tanggal: 'desc' },
        take: 20,
      }),
    ]);

    return {
      summary: {
        jumlahUpzKorporat: upzKorporat.length,
        jumlahMuzakkiUpz: muzakkiUpz.length,
        totalPayrollTerverifikasi: penerimaanPayroll.reduce((s, r) => s + r.nominal, 0),
        transaksiPayroll: penerimaanPayroll.length,
      },
      upzKorporat,
      muzakkiUpz: muzakkiUpz.map((m) => ({
        id: m.id,
        nomor: m.nomor,
        nama: m.nama,
        totalSetoran: m.totalSetoran,
        transaksiCount: m.transaksiCount,
      })),
      recentPayroll: penerimaanPayroll.map((p) => ({
        tanggal: p.tanggal,
        muzakki: p.muzakki.nama,
        jenisZis: p.jenisZis,
        nominal: p.nominal,
        noKwitansi: p.noKwitansi,
      })),
    };
  }

  static async update(
    id: string,
    input: Partial<{
      nama: string;
      kategori: string;
      hakPengelolaanPct: number;
      totalPenghimpunan: number;
      totalPenyaluran: number;
      statusKepatuhan: string;
    }>,
  ) {
    const existing = await prisma.upzCabang.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'UPZ cabang tidak ditemukan.' };
    }

    return prisma.upzCabang.update({
      where: { id },
      data: {
        ...(input.nama !== undefined && { nama: input.nama }),
        ...(input.kategori !== undefined && { kategori: input.kategori }),
        ...(input.hakPengelolaanPct !== undefined && { hakPengelolaanPct: input.hakPengelolaanPct }),
        ...(input.totalPenghimpunan !== undefined && { totalPenghimpunan: input.totalPenghimpunan }),
        ...(input.totalPenyaluran !== undefined && { totalPenyaluran: input.totalPenyaluran }),
        ...(input.statusKepatuhan !== undefined && { statusKepatuhan: input.statusKepatuhan }),
      },
      select: upzSelect,
    });
  }
}
