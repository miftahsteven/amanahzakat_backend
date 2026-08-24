import { prisma } from '../../lib/prisma';

function isZakatType(jenisZis: string): boolean {
  const j = jenisZis.toLowerCase();
  return j.includes('zakat') || j.includes('fitrah');
}

async function generateNoJurnal(): Promise<string> {
  const now = new Date();
  const prefix = `JRN/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/`;
  const latest = await prisma.jurnalEntry.findMany({
    where: { noJurnal: { startsWith: prefix } },
    orderBy: { noJurnal: 'desc' },
    take: 20,
  });
  let maxSeq = 0;
  for (const row of latest) {
    const match = row.noJurnal.match(/(\d+)$/);
    if (match) maxSeq = Math.max(maxSeq, parseInt(match[1], 10));
  }
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
}

export class KeuanganService {
  static async listCoa() {
    return prisma.accountCoA.findMany({ orderBy: { kode: 'asc' } });
  }

  static async listJurnal() {
    return prisma.jurnalEntry.findMany({ orderBy: { tanggal: 'desc' } });
  }

  static async createJurnal(input: {
    tanggal: string;
    keterangan: string;
    debitKode: string;
    kreditKode: string;
    nominal: number;
  }) {
    const [debit, kredit] = await Promise.all([
      prisma.accountCoA.findUnique({ where: { kode: input.debitKode } }),
      prisma.accountCoA.findUnique({ where: { kode: input.kreditKode } }),
    ]);
    if (!debit || !kredit) {
      throw { statusCode: 400, message: 'Kode akun debit/kredit tidak ditemukan di CoA.' };
    }

    const noJurnal = await generateNoJurnal();
    return prisma.jurnalEntry.create({
      data: {
        noJurnal,
        tanggal: input.tanggal,
        keterangan: input.keterangan,
        debitKode: debit.kode,
        debitNama: debit.nama,
        kreditKode: kredit.kode,
        kreditNama: kredit.nama,
        nominal: input.nominal,
        status: 'Posted',
      },
    });
  }

  static async listSimba() {
    const [forms, penerimaan, penyaluran, muzakki, mustahik, coa] = await Promise.all([
      prisma.formSimba.findMany({ orderBy: { kodeForm: 'asc' } }),
      prisma.transaksiPenerimaan.findMany({ where: { status: 'Terverifikasi' } }),
      prisma.transaksiPenyaluran.findMany({ where: { status: 'Sudah Tersalurkan' } }),
      prisma.muzakki.count(),
      prisma.mustahik.count({ where: { statusSurvei: 'Terverifikasi' } }),
      prisma.accountCoA.findMany(),
    ]);

    const totalPenerimaan = penerimaan.reduce((s, r) => s + r.nominal, 0);
    const totalPenyaluran = penyaluran.reduce((s, r) => s + r.nominal, 0);
    const totalNeraca = coa.filter((a) => a.grup === 'AKTIFA' || a.grup === 'PENDIRIAN').reduce((s, a) => s + a.saldo, 0);

    const liveCounts: Record<string, { itemCount: number; totalNilai: number }> = {
      FORM_1: { itemCount: penerimaan.length, totalNilai: totalPenerimaan },
      FORM_2: { itemCount: penyaluran.length, totalNilai: totalPenyaluran },
      FORM_3: { itemCount: muzakki, totalNilai: totalPenerimaan },
      FORM_4: { itemCount: mustahik, totalNilai: totalPenyaluran },
      FORM_5: { itemCount: coa.length, totalNilai: totalNeraca },
    };

    return forms.map((f) => ({
      ...f,
      itemCount: liveCounts[f.kodeForm]?.itemCount ?? f.itemCount,
      totalNilai: liveCounts[f.kodeForm]?.totalNilai ?? f.totalNilai,
    }));
  }

  static async exportSimba(kodeForm: string) {
    const form = await prisma.formSimba.findUnique({ where: { kodeForm } });
    if (!form) throw { statusCode: 404, message: 'Form SIMBA tidak ditemukan.' };
    return prisma.formSimba.update({
      where: { kodeForm },
      data: { status: 'Siap Kirim' },
    });
  }

  static async getClosing() {
    const now = new Date();
    const periode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const label = `${bulan[now.getMonth()]} ${now.getFullYear()}`;

    let row = await prisma.closingPeriode.findUnique({ where: { periode } });
    if (!row) {
      row = await prisma.closingPeriode.create({
        data: { periode, label },
      });
    }
    return row;
  }

  static async updateClosingStep(periode: string, stepId: string, done: boolean) {
    const fieldMap: Record<string, string> = {
      rekon: 'stepRekon',
      jurnal: 'stepJurnal',
      saldo: 'stepSaldo',
      laporan: 'stepLaporan',
    };
    const field = fieldMap[stepId];
    if (!field) throw { statusCode: 400, message: 'Langkah closing tidak valid.' };

    const existing = await prisma.closingPeriode.findUnique({ where: { periode } });
    if (!existing) throw { statusCode: 404, message: 'Periode closing tidak ditemukan.' };
    if (existing.isLocked) throw { statusCode: 409, message: 'Periode sudah terkunci.' };

    return prisma.closingPeriode.update({
      where: { periode },
      data: { [field]: done },
    });
  }

  static async toggleClosingLock(periode: string, lock: boolean) {
    const existing = await prisma.closingPeriode.findUnique({ where: { periode } });
    if (!existing) throw { statusCode: 404, message: 'Periode closing tidak ditemukan.' };

    if (lock) {
      const allDone = existing.stepRekon && existing.stepJurnal && existing.stepSaldo && existing.stepLaporan;
      if (!allDone) {
        throw { statusCode: 400, message: 'Selesaikan keempat langkah pra-tutup buku terlebih dahulu.' };
      }
    }

    return prisma.closingPeriode.update({
      where: { periode },
      data: {
        isLocked: lock,
        lockedAt: lock ? new Date().toISOString().slice(0, 10) : null,
      },
    });
  }

  /** Sync CoA saldo from live penerimaan/penyaluran (approx PSAK 109) */
  static async syncCoaSaldo() {
    const [penerimaan, penyaluran] = await Promise.all([
      prisma.transaksiPenerimaan.findMany({ where: { status: 'Terverifikasi' } }),
      prisma.transaksiPenyaluran.findMany({ where: { status: 'Sudah Tersalurkan' } }),
    ]);

    const zakatIn = penerimaan.filter((r) => isZakatType(r.jenisZis)).reduce((s, r) => s + r.nominal, 0);
    const infakIn = penerimaan.filter((r) => !isZakatType(r.jenisZis)).reduce((s, r) => s + r.nominal, 0);
    const zakatOut = penyaluran.reduce((s, r) => s + r.nominal, 0);
    const amil = Math.round(zakatIn * 0.125);

    const updates: Record<string, number> = {
      '101201': Math.max(0, zakatIn - zakatOut),
      '101202': infakIn,
      '301100': Math.max(0, zakatIn - zakatOut - amil),
      '302100': Math.max(0, infakIn - zakatOut * 0.3),
      '303100': amil,
      '401100': penerimaan.filter((r) => r.jenisZis.includes('Maal')).reduce((s, r) => s + r.nominal, 0),
      '401200': penerimaan.filter((r) => r.jenisZis.includes('Profesi')).reduce((s, r) => s + r.nominal, 0),
      '501100': penyaluran.filter((r) => ['Fakir', 'Miskin'].includes(r.asnaf)).reduce((s, r) => s + r.nominal, 0),
      '501200': penyaluran.filter((r) => r.asnaf === 'Fisabilillah').reduce((s, r) => s + r.nominal, 0),
    };

    for (const [kode, saldo] of Object.entries(updates)) {
      await prisma.accountCoA.updateMany({ where: { kode }, data: { saldo } });
    }
  }
}
