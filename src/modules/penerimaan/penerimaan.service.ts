import { prisma } from '../../lib/prisma';

export class PenerimaanService {
  static async list(jenisZis?: string) {
    const rows = await prisma.transaksiPenerimaan.findMany({
      where: jenisZis && jenisZis !== 'Semua' ? { jenisZis } : undefined,
      include: { muzakki: true },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => ({
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
      status: row.status as 'Terverifikasi' | 'Menunggu Verifikasi' | 'Ditolak',
      catatan: row.catatan,
    }));
  }

  static async listMuzakki() {
    return prisma.muzakki.findMany({
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
    if (!muzakki) {
      throw { statusCode: 404, message: 'Muzakki tidak ditemukan.' };
    }

    const noKwitansi = `KWT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

    const trx = await prisma.transaksiPenerimaan.create({
      data: {
        noKwitansi,
        tanggal: new Date().toISOString().slice(0, 10),
        muzakkiId: input.muzakkiId,
        jenisZis: input.jenisZis,
        programNama: input.programNama,
        nominal: input.nominal,
        kanal: input.kanal,
        rekeningTujuan: input.rekeningTujuan || 'BSI 7001234567 (Zakat Maal)',
        status: 'Terverifikasi',
        catatan: input.catatan,
      },
      include: { muzakki: true },
    });

    await prisma.muzakki.update({
      where: { id: muzakki.id },
      data: {
        totalSetoran: { increment: input.nominal },
        transaksiCount: { increment: 1 },
      },
    });

    return {
      id: trx.id,
      noKwitansi: trx.noKwitansi,
      tanggal: trx.tanggal,
      muzakkiId: trx.muzakkiId,
      muzakkiNama: trx.muzakki.nama,
      muzakkiTipe: trx.muzakki.tipe as 'Perorangan' | 'Korporat' | 'UPZ',
      jenisZis: trx.jenisZis,
      nominal: trx.nominal,
      kanal: trx.kanal,
      rekeningTujuan: trx.rekeningTujuan,
      status: trx.status as 'Terverifikasi',
      catatan: trx.catatan,
    };
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
      return existing;
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

    return {
      id: updated.id,
      noKwitansi: updated.noKwitansi,
      tanggal: updated.tanggal,
      muzakkiId: updated.muzakkiId,
      muzakkiNama: updated.muzakki.nama,
      muzakkiTipe: updated.muzakki.tipe as 'Perorangan' | 'Korporat' | 'UPZ',
      jenisZis: updated.jenisZis,
      nominal: updated.nominal,
      kanal: updated.kanal,
      rekeningTujuan: updated.rekeningTujuan,
      status: updated.status as 'Terverifikasi',
      catatan: updated.catatan,
    };
  }
}
