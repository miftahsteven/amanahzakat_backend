import { prisma } from '../../lib/prisma';

const BULAN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function isZakatType(jenisZis: string): boolean {
  const j = jenisZis.toLowerCase();
  return j.includes('zakat') || j.includes('fitrah');
}

function inDateRange(tanggal: string, dari?: string, sampai?: string): boolean {
  if (dari && tanggal < dari) return false;
  if (sampai && tanggal > sampai) return false;
  return true;
}

function growthPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function formatWibTimestamp(d: Date): string {
  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function asnafLabel(asnaf: string): string {
  if (asnaf === 'Fakir' || asnaf === 'Miskin') return 'Fakir & Miskin';
  if (asnaf === 'Gharim') return 'Gharimin';
  return asnaf;
}

function bucketKey(tanggal: string, skala: 'harian' | 'bulanan' | 'tahunan'): string {
  if (skala === 'tahunan') return tanggal.slice(0, 4);
  if (skala === 'bulanan') return tanggal.slice(0, 7);
  return tanggal;
}

function bucketLabel(key: string, skala: 'harian' | 'bulanan' | 'tahunan'): string {
  if (skala === 'tahunan') return key;
  if (skala === 'bulanan') {
    const month = parseInt(key.slice(5, 7), 10) - 1;
    return BULAN_SHORT[month] ?? key;
  }
  const [, m, d] = key.split('-');
  const month = parseInt(m, 10) - 1;
  return `${parseInt(d, 10)} ${BULAN_SHORT[month] ?? m}`;
}

export class DashboardService {
  static async getSummary(query: {
    dari?: string;
    sampai?: string;
    skala?: 'harian' | 'bulanan' | 'tahunan';
  }) {
    const skala = query.skala ?? 'bulanan';
    const now = new Date();
    const year = now.getFullYear();
    const defaultDari = `${year}-01-01`;
    const defaultSampai = now.toISOString().slice(0, 10);
    const dari = query.dari || defaultDari;
    const sampai = query.sampai || defaultSampai;

    const [penerimaanRows, penyaluranRows, programs] = await Promise.all([
      prisma.transaksiPenerimaan.findMany({
        where: { status: 'Terverifikasi' },
        include: { muzakki: true },
        orderBy: { tanggal: 'desc' },
      }),
      prisma.transaksiPenyaluran.findMany({
        where: { status: 'Sudah Tersalurkan' },
      }),
      prisma.programZis.findMany(),
    ]);

    const penerimaan = penerimaanRows.filter((r) => inDateRange(r.tanggal, dari, sampai));
    const penyaluran = penyaluranRows.filter((r) => inDateRange(r.tanggal, dari, sampai));

    const totalPenghimpunan = penerimaan.reduce((s, r) => s + r.nominal, 0);
    const danaZakat = penerimaan.filter((r) => isZakatType(r.jenisZis)).reduce((s, r) => s + r.nominal, 0);
    const totalPenyaluran = penyaluran.reduce((s, r) => s + r.nominal, 0);

    const paguTotal = programs.reduce((s, p) => s + p.paguAnggaran, 0);
    const terpakaiTotal = programs.reduce((s, p) => s + p.terpakai, 0);
    const serapanPct = paguTotal > 0 ? Math.round((terpakaiTotal / paguTotal) * 100) : 0;

    const currentMonthPrefix = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonth = new Date(year, now.getMonth() - 1, 1);
    const prevMonthPrefix = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const bulanIni = penerimaanRows.filter((r) => r.tanggal.startsWith(currentMonthPrefix));
    const bulanLalu = penerimaanRows.filter((r) => r.tanggal.startsWith(prevMonthPrefix));

    const bulanIniTotal = bulanIni.reduce((s, r) => s + r.nominal, 0);
    const bulanLaluTotal = bulanLalu.reduce((s, r) => s + r.nominal, 0);
    const bulanIniZakat = bulanIni.filter((r) => isZakatType(r.jenisZis)).reduce((s, r) => s + r.nominal, 0);
    const bulanLaluZakat = bulanLalu.filter((r) => isZakatType(r.jenisZis)).reduce((s, r) => s + r.nominal, 0);

    const penyaluranBulanIni = penyaluranRows.filter((r) => r.tanggal.startsWith(currentMonthPrefix));
    const penyaluranBulanLalu = penyaluranRows.filter((r) => r.tanggal.startsWith(prevMonthPrefix));
    const penyaluranBulanIniTotal = penyaluranBulanIni.reduce((s, r) => s + r.nominal, 0);
    const penyaluranBulanLaluTotal = penyaluranBulanLalu.reduce((s, r) => s + r.nominal, 0);

    const trendMap = new Map<string, { zakat: number; infak: number }>();
    for (const row of penerimaan) {
      const key = bucketKey(row.tanggal, skala);
      const cur = trendMap.get(key) ?? { zakat: 0, infak: 0 };
      if (isZakatType(row.jenisZis)) {
        cur.zakat += row.nominal;
      } else {
        cur.infak += row.nominal;
      }
      trendMap.set(key, cur);
    }

    const trendKeys = [...trendMap.keys()].sort();
    const trendTotal = penerimaan.reduce((s, r) => s + r.nominal, 0);
    const trendZakatTotal = penerimaan.filter((r) => isZakatType(r.jenisZis)).reduce((s, r) => s + r.nominal, 0);

    const trenPenghimpunan = trendKeys.map((key, idx) => {
      const { zakat, infak } = trendMap.get(key)!;
      const total = zakat + infak;
      const zakatJt = Math.round(zakat / 1_000_000);
      const infakJt = Math.round(infak / 1_000_000);
      const totalJt = zakatJt + infakJt;
      const pct = trendTotal > 0 ? Math.round((total / trendTotal) * 1000) / 10 : 0;

      let growth: number | null = null;
      if (idx > 0) {
        const prevKey = trendKeys[idx - 1];
        const prev = trendMap.get(prevKey)!;
        const prevTotal = prev.zakat + prev.infak;
        growth = growthPct(total, prevTotal);
      }

      return {
        key,
        label: bucketLabel(key, skala),
        zakat: zakatJt,
        infak: infakJt,
        total: totalJt,
        pct,
        growth,
      };
    });

    const asnafMap = new Map<string, number>();
    for (const row of penyaluran) {
      const label = asnafLabel(row.asnaf);
      asnafMap.set(label, (asnafMap.get(label) ?? 0) + row.nominal);
    }

    const asnafSorted = [...asnafMap.entries()].sort((a, b) => b[1] - a[1]);
    const maxAsnaf = asnafSorted[0]?.[1] ?? 1;

    const penyaluranPerAsnaf = asnafSorted.slice(0, 6).map(([nama, nominal]) => ({
      nama,
      nominal,
      percent: Math.round((nominal / maxAsnaf) * 100),
    }));

    const recentTransactions = penerimaanRows.slice(0, 5).map((r) => ({
      tanggal: r.tanggal,
      muzakki: r.muzakki.nama,
      jenisZis: r.jenisZis,
      kanal: r.kanal,
      nominal: r.nominal,
      isZakat: isZakatType(r.jenisZis),
    }));

    return {
      lastUpdated: formatWibTimestamp(now),
      filter: { dari, sampai, skala },
      summary: {
        totalPenghimpunan,
        totalPenghimpunanGrowth: growthPct(bulanIniTotal, bulanLaluTotal),
        transaksiBulanIni: bulanIni.length,
        danaZakat,
        danaZakatGrowth: growthPct(bulanIniZakat, bulanLaluZakat),
        totalPenyaluran,
        totalPenyaluranGrowth: growthPct(penyaluranBulanIniTotal, penyaluranBulanLaluTotal),
        penyaluranCount: penyaluran.length,
        serapanPct,
        paguTotal,
        terpakaiTotal,
      },
      trenMeta: {
        titikData: trenPenghimpunan.length,
        totalNominal: trendTotal,
        zakatPct: trendTotal > 0 ? Math.round((trendZakatTotal / trendTotal) * 100) : 0,
      },
      trenPenghimpunan,
      penyaluranPerAsnaf,
      recentTransactions,
    };
  }
}
