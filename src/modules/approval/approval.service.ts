import { prisma } from '../../lib/prisma';

export const DIREKSI_THRESHOLD = 50_000_000;
const TAHAP_NAMA = ['Maker', 'Checker', 'Approver'] as const;

export function totalTahapFor(nominal: number): number {
  return nominal >= DIREKSI_THRESHOLD ? 3 : 2;
}

export function tahapLabel(tahap: number, nominal: number): string {
  const total = totalTahapFor(nominal);
  const idx = Math.min(Math.max(tahap, 1) - 1, total - 1);
  return TAHAP_NAMA[idx] ?? 'Approver';
}

function mapItem(r: {
  id: string;
  ref: string;
  perihal: string;
  nominal: number;
  pengaju: string;
  tahap: number;
  tipe: string;
  status: string;
  penyaluranId: string | null;
}) {
  const totalTahap = totalTahapFor(r.nominal);
  return {
    id: r.id,
    ref: r.ref,
    perihal: r.perihal,
    nominal: r.nominal,
    pengaju: r.pengaju,
    tahap: r.tahap,
    tipe: r.tipe,
    status: r.status,
    penyaluranId: r.penyaluranId,
    totalTahap,
    perluDireksi: r.nominal >= DIREKSI_THRESHOLD,
    tahapNama: tahapLabel(r.tahap, r.nominal),
  };
}

export class ApprovalService {
  static async list(status?: string) {
    const where =
      !status || status === 'Menunggu'
        ? { status: 'Menunggu' }
        : status === 'Semua'
          ? {}
          : { status };

    const rows = await prisma.approvalPengajuan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapItem);
  }

  static async createFromPenyaluran(input: {
    penyaluranId: string;
    noPenyaluran: string;
    perihal: string;
    nominal: number;
    pengaju: string;
  }) {
    return prisma.approvalPengajuan.create({
      data: {
        ref: input.noPenyaluran,
        perihal: input.perihal,
        nominal: input.nominal,
        pengaju: input.pengaju,
        tahap: 1,
        tipe: 'penyaluran',
        status: 'Menunggu',
        penyaluranId: input.penyaluranId,
      },
    });
  }

  static async approve(id: string) {
    const item = await prisma.approvalPengajuan.findUnique({ where: { id } });
    if (!item || item.status !== 'Menunggu') {
      throw { statusCode: 404, message: 'Pengajuan approval tidak ditemukan.' };
    }

    const totalTahap = totalTahapFor(item.nominal);
    const nextTahap = item.tahap + 1;

    if (nextTahap > totalTahap) {
      if (item.penyaluranId) {
        const trx = await prisma.transaksiPenyaluran.findUnique({ where: { id: item.penyaluranId } });
        if (trx && trx.status === 'Menunggu Approval') {
          await prisma.transaksiPenyaluran.update({
            where: { id: item.penyaluranId },
            data: { status: 'Siap Bayar' },
          });
        }
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

  static async reject(id: string, catatan?: string) {
    const item = await prisma.approvalPengajuan.findUnique({ where: { id } });
    if (!item || item.status !== 'Menunggu') {
      throw { statusCode: 404, message: 'Pengajuan approval tidak ditemukan.' };
    }

    if (item.penyaluranId) {
      const trx = await prisma.transaksiPenyaluran.findUnique({ where: { id: item.penyaluranId } });
      if (trx && trx.status !== 'Sudah Tersalurkan') {
        const suffix = catatan?.trim() ? ` [Ditolak: ${catatan.trim()}]` : ' [Ditolak approval]';
        await prisma.transaksiPenyaluran.update({
          where: { id: item.penyaluranId },
          data: {
            status: 'Ditolak',
            keterangan: trx.keterangan.includes('[Ditolak') ? trx.keterangan : `${trx.keterangan}${suffix}`,
          },
        });
      }
    }

    return prisma.approvalPengajuan.update({
      where: { id },
      data: { status: 'Ditolak' },
    });
  }
}
