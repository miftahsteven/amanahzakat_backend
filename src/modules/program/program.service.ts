import { prisma } from '../../lib/prisma';

const programSelect = {
  id: true,
  nama: true,
  pilar: true,
  paguAnggaran: true,
  terpakai: true,
  targetPenerima: true,
  realisasiPenerima: true,
  status: true,
  penanggungJawab: true,
} as const;

export class ProgramService {
  static async list() {
    return prisma.programZis.findMany({
      orderBy: [{ pilar: 'asc' }, { nama: 'asc' }],
      select: programSelect,
    });
  }

  static async getById(id: string) {
    const row = await prisma.programZis.findUnique({ where: { id }, select: programSelect });
    if (!row) throw { statusCode: 404, message: 'Program ZIS tidak ditemukan.' };

    const [penyaluran, mitraList] = await Promise.all([
      prisma.transaksiPenyaluran.findMany({
        where: { programId: id },
        include: { mustahik: { select: { nama: true } } },
        orderBy: { tanggal: 'desc' },
        take: 30,
      }),
      prisma.mitraPenyalur.findMany({
        orderBy: { totalPenyaluran: 'desc' },
        take: 5,
        select: {
          id: true,
          nama: true,
          bentukLembaga: true,
          picKontak: true,
          totalPenyaluran: true,
          statusLaporanLpj: true,
        },
      }),
    ]);

    const sisaPagu = Math.max(0, row.paguAnggaran - row.terpakai);
    const pct = row.paguAnggaran > 0 ? Math.min(100, Math.round((row.terpakai / row.paguAnggaran) * 100)) : 0;
    const hot = pct > 85;

    const asnafMap = new Map<string, number>();
    for (const p of penyaluran) {
      asnafMap.set(p.asnaf, (asnafMap.get(p.asnaf) ?? 0) + p.nominal);
    }
    const asnafTotal = [...asnafMap.values()].reduce((s, n) => s + n, 0) || 1;
    const asnafRows = [...asnafMap.entries()]
      .map(([label, nominal]) => ({
        label,
        nominal,
        pct: Math.round((nominal / asnafTotal) * 100),
      }))
      .sort((a, b) => b.nominal - a.nominal);

    return {
      ...row,
      tahun: new Date().getFullYear(),
      sisaPagu,
      pct,
      statusLabel: hot ? 'Hampir habis' : row.status,
      asnafRows,
      salurRows: penyaluran.map((p) => ({
        id: p.id,
        tanggal: p.tanggal,
        noPenyaluran: p.noPenyaluran,
        mustahikNama: p.mustahik.nama,
        asnaf: p.asnaf,
        nominal: p.nominal,
        status: p.status,
      })),
      mitraRows: mitraList.map((m) => ({
        id: m.id,
        nama: m.nama,
        bentukLembaga: m.bentukLembaga,
        pic: m.picKontak,
        dana: m.totalPenyaluran,
        laporan: m.statusLaporanLpj,
      })),
    };
  }

  static async create(input: {
    nama: string;
    pilar: string;
    paguAnggaran: number;
    targetPenerima: number;
    penanggungJawab: string;
    status?: string;
  }) {
    return prisma.programZis.create({
      data: {
        nama: input.nama,
        pilar: input.pilar,
        paguAnggaran: input.paguAnggaran,
        targetPenerima: input.targetPenerima,
        penanggungJawab: input.penanggungJawab,
        status: input.status || 'Berjalan',
        terpakai: 0,
        realisasiPenerima: 0,
      },
      select: programSelect,
    });
  }

  static async update(
    id: string,
    input: Partial<{
      nama: string;
      pilar: string;
      paguAnggaran: number;
      targetPenerima: number;
      penanggungJawab: string;
      status: string;
    }>,
  ) {
    const existing = await prisma.programZis.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Program ZIS tidak ditemukan.' };
    }

    return prisma.programZis.update({
      where: { id },
      data: {
        ...(input.nama !== undefined && { nama: input.nama }),
        ...(input.pilar !== undefined && { pilar: input.pilar }),
        ...(input.paguAnggaran !== undefined && { paguAnggaran: input.paguAnggaran }),
        ...(input.targetPenerima !== undefined && { targetPenerima: input.targetPenerima }),
        ...(input.penanggungJawab !== undefined && { penanggungJawab: input.penanggungJawab }),
        ...(input.status !== undefined && { status: input.status }),
      },
      select: programSelect,
    });
  }
}
