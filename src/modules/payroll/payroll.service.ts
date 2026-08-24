import { prisma } from '../../lib/prisma';

const amilSelect = {
  id: true,
  nip: true,
  nama: true,
  jabatan: true,
  divisi: true,
  gajiPokok: true,
  tunjanganAmil: true,
  potonganZakat: true,
  keikutsertaanPayroll: true,
  statusKerja: true,
} as const;

function calcPotonganZakat(gajiPokok: number, tunjanganAmil: number): number {
  return Math.round((gajiPokok + tunjanganAmil) * 0.025);
}

async function generateNip(): Promise<string> {
  const latest = await prisma.amilKaryawan.findMany({
    where: { nip: { startsWith: 'AML-' } },
    orderBy: { nip: 'desc' },
    take: 50,
  });

  let maxSeq = 0;
  for (const row of latest) {
    const match = row.nip.match(/^AML-(\d+)$/);
    if (match) {
      maxSeq = Math.max(maxSeq, parseInt(match[1], 10));
    }
  }

  return `AML-${String(maxSeq + 1).padStart(3, '0')}`;
}

export class PayrollService {
  static async list(divisi?: string) {
    return prisma.amilKaryawan.findMany({
      where:
        divisi && divisi !== 'Semua'
          ? { divisi: { equals: divisi, mode: 'insensitive' } }
          : undefined,
      orderBy: [{ nip: 'asc' }],
      select: amilSelect,
    });
  }

  static async create(input: {
    nama: string;
    jabatan: string;
    divisi: string;
    gajiPokok: number;
    tunjanganAmil: number;
    keikutsertaanPayroll?: boolean;
    statusKerja?: string;
  }) {
    const nip = await generateNip();
    const potonganZakat = calcPotonganZakat(input.gajiPokok, input.tunjanganAmil);

    return prisma.amilKaryawan.create({
      data: {
        nip,
        nama: input.nama,
        jabatan: input.jabatan,
        divisi: input.divisi,
        gajiPokok: input.gajiPokok,
        tunjanganAmil: input.tunjanganAmil,
        potonganZakat,
        keikutsertaanPayroll: input.keikutsertaanPayroll ?? true,
        statusKerja: input.statusKerja ?? 'Tetap',
      },
      select: amilSelect,
    });
  }

  static async update(
    id: string,
    input: Partial<{
      nama: string;
      jabatan: string;
      divisi: string;
      gajiPokok: number;
      tunjanganAmil: number;
      keikutsertaanPayroll: boolean;
      statusKerja: string;
    }>,
  ) {
    const existing = await prisma.amilKaryawan.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Data amil/karyawan tidak ditemukan.' };
    }

    const gajiPokok = input.gajiPokok ?? existing.gajiPokok;
    const tunjanganAmil = input.tunjanganAmil ?? existing.tunjanganAmil;
    const potonganZakat =
      input.gajiPokok !== undefined || input.tunjanganAmil !== undefined
        ? calcPotonganZakat(gajiPokok, tunjanganAmil)
        : undefined;

    return prisma.amilKaryawan.update({
      where: { id },
      data: {
        ...(input.nama !== undefined && { nama: input.nama }),
        ...(input.jabatan !== undefined && { jabatan: input.jabatan }),
        ...(input.divisi !== undefined && { divisi: input.divisi }),
        ...(input.gajiPokok !== undefined && { gajiPokok: input.gajiPokok }),
        ...(input.tunjanganAmil !== undefined && { tunjanganAmil: input.tunjanganAmil }),
        ...(potonganZakat !== undefined && { potonganZakat }),
        ...(input.keikutsertaanPayroll !== undefined && {
          keikutsertaanPayroll: input.keikutsertaanPayroll,
        }),
        ...(input.statusKerja !== undefined && { statusKerja: input.statusKerja }),
      },
      select: amilSelect,
    });
  }

  static async processPayroll(periode?: string) {
    const rows = await prisma.amilKaryawan.findMany({
      where: { keikutsertaanPayroll: true, statusKerja: { not: 'Relawan' } },
      orderBy: { nip: 'asc' },
      select: amilSelect,
    });

    const slips = rows.map((r) => {
      const bruto = r.gajiPokok + r.tunjanganAmil;
      const netto = bruto - r.potonganZakat;
      return {
        ...r,
        bruto,
        netto,
      };
    });

    const totalBruto = slips.reduce((s, r) => s + r.bruto, 0);
    const totalPotongan = slips.reduce((s, r) => s + r.potonganZakat, 0);
    const totalNetto = slips.reduce((s, r) => s + r.netto, 0);

    const now = new Date();
    const label =
      periode ||
      now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    return {
      periode: label,
      jumlahAmil: slips.length,
      totalBruto,
      totalPotonganZakat: totalPotongan,
      totalNetto,
      slips,
    };
  }
}
