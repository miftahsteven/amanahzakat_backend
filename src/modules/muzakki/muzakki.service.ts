import { prisma } from '../../lib/prisma';

const muzakkiSelect = {
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
} as const;

async function generateNomorMuzakki(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `MZK-${year}-`;

  const latest = await prisma.muzakki.findMany({
    where: { nomor: { startsWith: prefix } },
    orderBy: { nomor: 'desc' },
    take: 50,
  });

  let maxSeq = 0;
  for (const row of latest) {
    const match = row.nomor.match(new RegExp(`^MZK-${year}-(\\d+)$`));
    if (match) {
      maxSeq = Math.max(maxSeq, parseInt(match[1], 10));
    }
  }

  return `${prefix}${String(maxSeq + 1).padStart(5, '0')}`;
}

export class MuzakkiService {
  static async list() {
    return prisma.muzakki.findMany({
      orderBy: [{ nomor: 'desc' }],
      select: muzakkiSelect,
    });
  }

  static async create(input: {
    nama: string;
    tipe: string;
    nikAtauNpwp: string;
    hp: string;
    email: string;
    alamat: string;
  }) {
    const existing = await prisma.muzakki.findFirst({
      where: {
        OR: [{ email: input.email }, { nikAtauNpwp: input.nikAtauNpwp }],
      },
    });

    if (existing) {
      throw {
        statusCode: 409,
        message: 'Email atau NIK/NPWP sudah terdaftar pada muzakki lain.',
      };
    }

    const nomor = await generateNomorMuzakki();

    return prisma.muzakki.create({
      data: {
        nomor,
        nama: input.nama,
        tipe: input.tipe,
        nikAtauNpwp: input.nikAtauNpwp,
        hp: input.hp,
        email: input.email,
        alamat: input.alamat,
        totalSetoran: 0,
        transaksiCount: 0,
        tanggalBergabung: new Date().toISOString().slice(0, 10),
      },
      select: muzakkiSelect,
    });
  }
}
