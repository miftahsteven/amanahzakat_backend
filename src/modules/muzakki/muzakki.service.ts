import { prisma } from '../../lib/prisma';
import { activeOnly, assertActiveRecord } from '../../lib/soft-delete';

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

function inisialNama(nama: string) {
  return nama
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

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

async function mapMuzakkiDetail(row: {
  id: string;
  nomor: string;
  nama: string;
  tipe: string;
  nikAtauNpwp: string;
  hp: string;
  email: string;
  alamat: string;
  totalSetoran: number;
  transaksiCount: number;
  tanggalBergabung: string;
}) {
  const trx = await prisma.transaksiPenerimaan.findMany({
    where: { muzakkiId: row.id },
    orderBy: { tanggal: 'desc' },
    take: 20,
  });

  const totalTrx = trx.reduce((s, t) => s + t.nominal, 0);
  const basis = totalTrx || row.totalSetoran || 1;
  const jenisMap = new Map<string, number>();
  for (const t of trx) {
    jenisMap.set(t.jenisZis, (jenisMap.get(t.jenisZis) ?? 0) + t.nominal);
  }

  let jenisRows =
    jenisMap.size > 0
      ? [...jenisMap.entries()].map(([label, nominal]) => ({ label, nominal }))
      : [
          { label: 'Zakat Maal', nominal: Math.round(row.totalSetoran * 0.62) },
          { label: 'Infak', nominal: Math.round(row.totalSetoran * 0.26) },
          { label: 'Shodaqoh', nominal: Math.round(row.totalSetoran * 0.12) },
        ];

  jenisRows = jenisRows.sort((a, b) => b.nominal - a.nominal);

  const programMap = new Map<string, number>();
  for (const t of trx) {
    if (!t.programNama) continue;
    programMap.set(t.programNama, (programMap.get(t.programNama) ?? 0) + t.nominal);
  }
  const kampanyeRows = [...programMap.entries()]
    .slice(0, 5)
    .map(([nama, nominal]) => ({ nama, program: nama, nominal }));

  const count = trx.length || row.transaksiCount || 1;

  return {
    ...row,
    tipe: row.tipe as 'Perorangan' | 'Korporat' | 'UPZ',
    inisial: inisialNama(row.nama),
    kontak: row.hp || row.email,
    jenisRows: jenisRows.map((j) => ({
      label: j.label,
      nominal: j.nominal,
      pct: Math.round((j.nominal / basis) * 100),
    })),
    kampanyeRows,
    trxRows: trx.map((t) => ({
      id: t.id,
      noKwitansi: t.noKwitansi,
      tanggal: t.tanggal,
      jenisZis: t.jenisZis,
      kanal: t.kanal,
      nominal: t.nominal,
      status: t.status,
    })),
    rataRataDonasi: Math.round((totalTrx || row.totalSetoran) / count),
    donasiTerakhir: trx[0] ? { nominal: trx[0].nominal, tanggal: trx[0].tanggal } : undefined,
  };
}

export class MuzakkiService {
  static async list() {
    return prisma.muzakki.findMany({
      where: activeOnly,
      orderBy: [{ nomor: 'desc' }],
      select: muzakkiSelect,
    });
  }

  static async getById(id: string) {
    const row = await prisma.muzakki.findUnique({ where: { id }, select: muzakkiSelect });
    if (!row) throw { statusCode: 404, message: 'Muzakki tidak ditemukan.' };
    return mapMuzakkiDetail(row);
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
        ...activeOnly,
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

  static async update(
    id: string,
    input: {
      nama: string;
      tipe: string;
      nikAtauNpwp: string;
      hp: string;
      email: string;
      alamat: string;
    },
  ) {
    const existing = await prisma.muzakki.findUnique({ where: { id } });
    assertActiveRecord(existing, 'Muzakki');

    const duplicate = await prisma.muzakki.findFirst({
      where: {
        ...activeOnly,
        id: { not: id },
        OR: [{ email: input.email }, { nikAtauNpwp: input.nikAtauNpwp }],
      },
    });
    if (duplicate) {
      throw {
        statusCode: 409,
        message: 'Email atau NIK/NPWP sudah terdaftar pada muzakki lain.',
      };
    }

    return prisma.muzakki.update({
      where: { id },
      data: {
        nama: input.nama,
        tipe: input.tipe,
        nikAtauNpwp: input.nikAtauNpwp,
        hp: input.hp,
        email: input.email,
        alamat: input.alamat,
      },
      select: muzakkiSelect,
    });
  }

  static async remove(id: string) {
    const existing = await prisma.muzakki.findUnique({ where: { id } });
    assertActiveRecord(existing, 'Muzakki');

    await prisma.muzakki.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { id };
  }
}
