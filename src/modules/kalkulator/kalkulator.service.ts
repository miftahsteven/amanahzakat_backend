import { ZakatJenisHitung } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import {
  DEFAULT_ZAKAT_CONFIG,
  enrichZakatConfig,
  hitungZakat,
  ZakatConfigParams,
  ZakatHitungInput,
} from '../../lib/zakat-calculator';

export class KalkulatorService {
  static async getConfigRaw(): Promise<ZakatConfigParams> {
    const row = await prisma.zakatConfig.findUnique({ where: { id: 'default-zakat-config' } });
    if (!row) return DEFAULT_ZAKAT_CONFIG;

    return {
      hargaEmasPerGram: row.hargaEmasPerGram,
      hargaBerasPerKg: row.hargaBerasPerKg,
      nisabEmasGram: row.nisabEmasGram,
      nisabBerasKg: row.nisabBerasKg,
      nisabPertanianKg: row.nisabPertanianKg,
      zakatRate: row.zakatRate,
      fitrahKgPerJiwa: row.fitrahKgPerJiwa,
    };
  }

  static async getConfig() {
    const row = await prisma.zakatConfig.findUnique({ where: { id: 'default-zakat-config' } });
    if (!row) {
      return enrichZakatConfig({
        id: 'default-zakat-config',
        ...DEFAULT_ZAKAT_CONFIG,
        updatedAt: new Date(),
        updatedById: null,
      });
    }
    return enrichZakatConfig(row);
  }

  static async updateConfig(data: ZakatConfigParams, userId?: string) {
    const row = await prisma.zakatConfig.upsert({
      where: { id: 'default-zakat-config' },
      update: {
        ...data,
        updatedById: userId ?? null,
      },
      create: {
        id: 'default-zakat-config',
        ...data,
        updatedById: userId ?? null,
      },
    });
    return enrichZakatConfig(row);
  }

  static async hitung(
    payload: ZakatHitungInput,
    opts: { sumber: 'ERP' | 'WEB_PUBLIC'; userId?: string; ipAddress?: string; simpanLog?: boolean }
  ) {
    const config = await this.getConfigRaw();
    const hasil = hitungZakat(config, payload);

    if (opts.simpanLog !== false) {
      await prisma.zakatPerhitunganLog.create({
        data: {
          jenis: payload.jenis as ZakatJenisHitung,
          inputData: payload.input as object,
          hasilNominal: hasil.hasilNominal,
          wajibZakat: hasil.wajibZakat,
          sumber: opts.sumber,
          userId: opts.userId ?? null,
          ipAddress: opts.ipAddress ?? null,
        },
      });
    }

    return {
      config: enrichZakatConfig({
        id: 'default-zakat-config',
        ...config,
        updatedAt: new Date(),
        updatedById: null,
      }),
      ...hasil,
    };
  }

  static async listRiwayat(params: {
    limit?: number;
    jenis?: ZakatJenisHitung;
    sumber?: string;
  }) {
    const limit = params.limit ?? 50;
    const where: {
      jenis?: ZakatJenisHitung;
      sumber?: string;
    } = {};

    if (params.jenis) where.jenis = params.jenis;
    if (params.sumber) where.sumber = params.sumber;

    const rows = await prisma.zakatPerhitunganLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return rows.map((r) => ({
      id: r.id,
      jenis: r.jenis,
      inputData: r.inputData,
      hasilNominal: r.hasilNominal,
      wajibZakat: r.wajibZakat,
      sumber: r.sumber,
      userId: r.userId,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
