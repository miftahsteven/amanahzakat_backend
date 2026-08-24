import { prisma } from '../../lib/prisma';

const mitraSelect = {
  id: true,
  nama: true,
  bentukLembaga: true,
  noMou: true,
  masaKerjasama: true,
  picKontak: true,
  hpPic: true,
  totalPenyaluran: true,
  statusLaporanLpj: true,
} as const;

async function generateNoMou(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `MOU/AZ/${year}/`;

  const latest = await prisma.mitraPenyalur.findMany({
    where: { noMou: { startsWith: prefix } },
    orderBy: { noMou: 'desc' },
    take: 50,
  });

  let maxSeq = 0;
  for (const row of latest) {
    const match = row.noMou.match(new RegExp(`^MOU/AZ/${year}/(\\d+)$`));
    if (match) {
      maxSeq = Math.max(maxSeq, parseInt(match[1], 10));
    }
  }

  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
}

export class MitraService {
  static async list(statusLpj?: string) {
    return prisma.mitraPenyalur.findMany({
      where:
        statusLpj && statusLpj !== 'Semua'
          ? { statusLaporanLpj: { equals: statusLpj, mode: 'insensitive' } }
          : undefined,
      orderBy: [{ totalPenyaluran: 'desc' }, { nama: 'asc' }],
      select: mitraSelect,
    });
  }

  static async getById(id: string) {
    const row = await prisma.mitraPenyalur.findUnique({ where: { id }, select: mitraSelect });
    if (!row) throw { statusCode: 404, message: 'Mitra penyalur tidak ditemukan.' };

    const programs = await prisma.programZis.findMany({
      where: { status: 'Berjalan' },
      orderBy: { terpakai: 'desc' },
      take: 3,
      select: {
        id: true,
        nama: true,
        penanggungJawab: true,
        paguAnggaran: true,
        terpakai: true,
      },
    });

    // Approximate recent penyaluran context (no direct FK mitra→penyaluran)
    const penyaluran = await prisma.transaksiPenyaluran.findMany({
      where: { status: 'Sudah Tersalurkan' },
      include: { mustahik: { select: { nama: true } }, program: { select: { nama: true } } },
      orderBy: { tanggal: 'desc' },
      take: 12,
    });

    const verified = row.statusLaporanLpj === 'Terverifikasi';
    const inisial = row.nama
      .split(' ')
      .filter((w) => w.length > 2)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

    return {
      ...row,
      inisial,
      profil: [
        { label: 'Bentuk Lembaga', value: row.bentukLembaga },
        { label: 'Nomor MoU', value: row.noMou },
        { label: 'Kontak PIC', value: `${row.picKontak} · ${row.hpPic}` },
        { label: 'Masa Kerja Sama', value: row.masaKerjasama },
        { label: 'Status LPJ', value: row.statusLaporanLpj },
      ],
      programTerkait: programs.map((p) => ({
        id: p.id,
        nama: p.nama,
        pj: p.penanggungJawab,
        pagu: p.paguAnggaran,
        terpakai: p.terpakai,
      })),
      transaksi: penyaluran.slice(0, 8).map((p) => ({
        id: p.id,
        tanggal: p.tanggal,
        penerima: p.mustahik.nama,
        program: p.program.nama,
        asnaf: p.asnaf,
        nominal: p.nominal,
        status: p.status,
      })),
      dokumen: [
        { nama: 'MoU Kerja Sama Program', status: 'Lengkap' },
        { nama: 'Laporan Kegiatan Triwulan', status: verified ? 'Lengkap' : 'Menunggu Review' },
        { nama: 'Bukti Serah Terima Penerima Manfaat', status: 'Lengkap' },
        { nama: 'Laporan Keuangan Penggunaan Dana', status: verified ? 'Lengkap' : 'Menunggu Review' },
      ],
    };
  }

  static async create(input: {
    nama: string;
    bentukLembaga: string;
    masaKerjasama: string;
    picKontak: string;
    hpPic: string;
    totalPenyaluran?: number;
    statusLaporanLpj?: string;
  }) {
    const noMou = await generateNoMou();

    return prisma.mitraPenyalur.create({
      data: {
        nama: input.nama,
        bentukLembaga: input.bentukLembaga,
        noMou,
        masaKerjasama: input.masaKerjasama,
        picKontak: input.picKontak,
        hpPic: input.hpPic,
        totalPenyaluran: input.totalPenyaluran ?? 0,
        statusLaporanLpj: input.statusLaporanLpj ?? 'Menunggu LPJ',
      },
      select: mitraSelect,
    });
  }

  static async update(
    id: string,
    input: Partial<{
      nama: string;
      bentukLembaga: string;
      masaKerjasama: string;
      picKontak: string;
      hpPic: string;
      totalPenyaluran: number;
      statusLaporanLpj: string;
    }>,
  ) {
    const existing = await prisma.mitraPenyalur.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Mitra penyalur tidak ditemukan.' };
    }

    return prisma.mitraPenyalur.update({
      where: { id },
      data: {
        ...(input.nama !== undefined && { nama: input.nama }),
        ...(input.bentukLembaga !== undefined && { bentukLembaga: input.bentukLembaga }),
        ...(input.masaKerjasama !== undefined && { masaKerjasama: input.masaKerjasama }),
        ...(input.picKontak !== undefined && { picKontak: input.picKontak }),
        ...(input.hpPic !== undefined && { hpPic: input.hpPic }),
        ...(input.totalPenyaluran !== undefined && { totalPenyaluran: input.totalPenyaluran }),
        ...(input.statusLaporanLpj !== undefined && { statusLaporanLpj: input.statusLaporanLpj }),
      },
      select: mitraSelect,
    });
  }
}
