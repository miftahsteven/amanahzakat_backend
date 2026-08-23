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
