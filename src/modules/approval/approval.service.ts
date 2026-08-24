import { prisma } from '../../lib/prisma';

const TAHAP_NAMA = ['Maker', 'Checker', 'Approver'];

export class ApprovalService {
  static async list() {
    const rows = await prisma.approvalPengajuan.findMany({
      where: { status: 'Menunggu' },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      ref: r.ref,
      perihal: r.perihal,
      nominal: r.nominal,
      pengaju: r.pengaju,
      tahap: r.tahap,
      tipe: r.tipe,
      penyaluranId: r.penyaluranId,
    }));
  }

  static async approve(id: string) {
    const item = await prisma.approvalPengajuan.findUnique({ where: { id } });
    if (!item || item.status !== 'Menunggu') {
      throw { statusCode: 404, message: 'Pengajuan approval tidak ditemukan.' };
    }

    const perluDireksi = item.nominal >= 50_000_000;
    const totalTahap = perluDireksi ? 3 : 2;
    const nextTahap = item.tahap + 1;

    if (nextTahap > totalTahap) {
      if (item.penyaluranId) {
        await prisma.transaksiPenyaluran.update({
          where: { id: item.penyaluranId },
          data: { status: 'Sudah Tersalurkan' },
        });
      }
      return prisma.approvalPengajuan.update({
        where: { id },
        data: { status: 'Disetujui', tahap: nextTahap },
      });
    }

    return prisma.approvalPengajuan.update({
      where: { id },
      data: { tahap: nextTahap },
    });
  }

  static async reject(id: string) {
    const item = await prisma.approvalPengajuan.findUnique({ where: { id } });
    if (!item) throw { statusCode: 404, message: 'Pengajuan approval tidak ditemukan.' };

    if (item.penyaluranId) {
      await prisma.transaksiPenyaluran.delete({ where: { id: item.penyaluranId } }).catch(() => null);
    }

    return prisma.approvalPengajuan.update({
      where: { id },
      data: { status: 'Ditolak' },
    });
  }

  static tahapLabel(tahap: number, nominal: number): string {
    const perluDireksi = nominal >= 50_000_000;
    const total = perluDireksi ? 3 : 2;
    const idx = Math.min(tahap - 1, total - 1);
    return TAHAP_NAMA[idx] ?? 'Approver';
  }
}
