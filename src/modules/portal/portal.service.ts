import { prisma } from '../../lib/prisma';

export class PortalService {
  static async getSummary() {
    const [pengajuan, mustahikAuthCount, settings, impact] = await Promise.all([
      prisma.pengajuanBantuan.findMany({ select: { status: true, stageStatus: true } }),
      prisma.mustahikAuth.count(),
      prisma.webSetting.findFirst(),
      prisma.impactData.findFirst(),
    ]);

    const byStatus = new Map<string, number>();
    for (const p of pengajuan) {
      byStatus.set(p.status, (byStatus.get(p.status) ?? 0) + 1);
    }

    return {
      totalPengajuan: pengajuan.length,
      mustahikTerdaftar: mustahikAuthCount,
      byStatus: [...byStatus.entries()].map(([status, count]) => ({ status, count })),
      webSettings: settings
        ? {
            siteName: settings.siteName,
            siteTagline: settings.siteTagline,
            contactPhone: settings.contactPhone,
            contactEmail: settings.contactEmail,
            contactAddress: settings.contactAddress,
          }
        : null,
      impactHighlight: impact?.metrics ?? null,
    };
  }

  static async listPengajuan(limit = 50) {
    const rows = await prisma.pengajuanBantuan.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      submissionNumber: r.submissionNumber,
      nik: r.nik,
      namaLengkap: r.namaLengkap,
      asnafCategory: r.asnafCategory,
      telepon: r.telepon,
      programBantuanDimohon: r.programBantuanDimohon,
      estimasiBiayaDibutuhkan: r.estimasiBiayaDibutuhkan,
      status: r.status,
      stageStatus: r.stageStatus,
      kotaKabupaten: r.kotaKabupaten,
      provinsi: r.provinsi,
      createdAt: r.createdAt.toISOString(),
      tahapanProses: r.tahapanProses,
    }));
  }

  static async track(query: string) {
    const clean = query.trim();
    if (!clean) {
      throw { statusCode: 400, message: 'Nomor tiket atau NIK wajib diisi.' };
    }

    const submission = await prisma.pengajuanBantuan.findFirst({
      where: {
        OR: [
          { submissionNumber: { equals: clean, mode: 'insensitive' } },
          { nik: clean },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!submission) {
      throw { statusCode: 404, message: 'Pengajuan bantuan tidak ditemukan. Periksa nomor tiket atau NIK.' };
    }

    return {
      id: submission.id,
      submissionNumber: submission.submissionNumber,
      nik: submission.nik,
      namaLengkap: submission.namaLengkap,
      asnafCategory: submission.asnafCategory,
      telepon: submission.telepon,
      programBantuanDimohon: submission.programBantuanDimohon,
      estimasiBiayaDibutuhkan: submission.estimasiBiayaDibutuhkan,
      status: submission.status,
      stageStatus: submission.stageStatus,
      alamatLengkap: submission.alamatLengkap,
      kotaKabupaten: submission.kotaKabupaten,
      provinsi: submission.provinsi,
      surveiNotes: submission.surveiNotes,
      tahapanProses: submission.tahapanProses ?? [],
      createdAt: submission.createdAt.toISOString(),
    };
  }
}
