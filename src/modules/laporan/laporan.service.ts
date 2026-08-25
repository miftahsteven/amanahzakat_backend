import { prisma } from '../../lib/prisma';
import { detectWilayahBase, resolveMustahikCoords } from '../../lib/geocode';
import { activeOnly } from '../../lib/soft-delete';

function inDateRange(tanggal: string, dari?: string, sampai?: string): boolean {
  if (dari && tanggal < dari) return false;
  if (sampai && tanggal > sampai) return false;
  return true;
}

function asnafLabel(asnaf: string): string {
  if (asnaf === 'Fakir' || asnaf === 'Miskin') return 'Fakir & Miskin';
  if (asnaf === 'Gharim') return 'Gharimin';
  return asnaf;
}

type WilayahMeta = { id: string; nama: string; mapTop: string; mapLeft: string; lat: number; lng: number };

const WILAYAH_RULES: { id: string; nama: string; keywords: string[]; mapTop: string; mapLeft: string }[] = [
  {
    id: 'dki',
    nama: 'DKI Jakarta (Jaksel, Jaktim, Jakpus)',
    keywords: ['jakarta', 'kebayoran', 'jatinegara', 'pondok labu', 'menteng'],
    mapTop: '33%',
    mapLeft: '25%',
  },
  {
    id: 'banten',
    nama: 'Banten (Tangerang, Serang, Lebak)',
    keywords: ['tangerang', 'serang', 'banten', 'cikupa', 'lebak'],
    mapTop: '75%',
    mapLeft: '20%',
  },
  {
    id: 'ntb',
    nama: 'Nusa Tenggara Barat (Lombok, Sumbawa)',
    keywords: ['lombok', 'sumbawa', 'ntb', 'ntt', 'mataram', 'dompu'],
    mapTop: '67%',
    mapLeft: '75%',
  },
  {
    id: 'jabar',
    nama: 'Jawa Barat (Bandung, Bekasi, Bogor, Depok)',
    keywords: ['bandung', 'bekasi', 'bogor', 'depok', 'cileunyi', 'bojongsoang', 'arcamanik', 'jawa barat'],
    mapTop: '25%',
    mapLeft: '33%',
  },
];

function detectWilayah(alamat: string): WilayahMeta {
  const lower = alamat.toLowerCase();
  for (const rule of WILAYAH_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      const base = detectWilayahBase(alamat);
      return { id: rule.id, nama: rule.nama, mapTop: rule.mapTop, mapLeft: rule.mapLeft, lat: base.lat, lng: base.lng };
    }
  }
  const base = detectWilayahBase(alamat);
  return { id: 'lainnya', nama: 'Wilayah Lainnya', mapTop: '50%', mapLeft: '50%', lat: base.lat, lng: base.lng };
}

export class LaporanService {
  static async getDistribusi(query: { dari?: string; sampai?: string }) {
    const now = new Date();
    const year = now.getFullYear();
    const dari = query.dari || `${year}-01-01`;
    const sampai = query.sampai || now.toISOString().slice(0, 10);

    const rows = await prisma.transaksiPenyaluran.findMany({
      where: { status: 'Sudah Tersalurkan' },
      include: { mustahik: true, program: true },
      orderBy: { tanggal: 'desc' },
    });

    const filtered = rows.filter((r) => inDateRange(r.tanggal, dari, sampai));

    const totalNominal = filtered.reduce((s, r) => s + r.nominal, 0);
    const totalDanaMustahik = filtered.reduce((s, r) => s + r.danaMustahik, 0);
    const mustahikIds = new Set(filtered.map((r) => r.mustahikId));

    const asnafMap = new Map<string, { count: number; nominal: number }>();
    const programMap = new Map<string, { nama: string; count: number; nominal: number }>();

    for (const row of filtered) {
      const label = asnafLabel(row.asnaf);
      const asnafCur = asnafMap.get(label) ?? { count: 0, nominal: 0 };
      asnafCur.count += 1;
      asnafCur.nominal += row.nominal;
      asnafMap.set(label, asnafCur);

      const progCur = programMap.get(row.programId) ?? {
        nama: row.program.nama,
        count: 0,
        nominal: 0,
      };
      progCur.count += 1;
      progCur.nominal += row.nominal;
      programMap.set(row.programId, progCur);
    }

    const perAsnaf = [...asnafMap.entries()]
      .map(([nama, v]) => ({ nama, transaksi: v.count, nominal: v.nominal }))
      .sort((a, b) => b.nominal - a.nominal);

    const perProgram = [...programMap.entries()]
      .map(([id, v]) => ({ id, nama: v.nama, transaksi: v.count, nominal: v.nominal }))
      .sort((a, b) => b.nominal - a.nominal);

    const transaksi = filtered.map((r) => ({
      id: r.id,
      noPenyaluran: r.noPenyaluran,
      tanggal: r.tanggal,
      mustahikNama: r.mustahik.nama,
      asnaf: r.asnaf,
      programNama: r.program.nama,
      nominal: r.nominal,
      danaMustahik: r.danaMustahik,
      metodePembayaran: r.metodePembayaran,
      keterangan: r.keterangan,
    }));

    return {
      filter: { dari, sampai },
      summary: {
        totalTransaksi: filtered.length,
        totalNominal,
        totalDanaMustahik,
        mustahikTerbantu: mustahikIds.size,
      },
      perAsnaf,
      perProgram,
      transaksi,
    };
  }

  static async getSebaran() {
    const [mustahikList, penyaluranRows] = await Promise.all([
      prisma.mustahik.findMany({
        where: { ...activeOnly, statusSurvei: 'Terverifikasi' },
        select: { id: true, nama: true, alamat: true, kategoriAsnaf: true, lat: true, lng: true, nik: true },
      }),
      prisma.transaksiPenyaluran.findMany({
        where: { status: 'Sudah Tersalurkan' },
        select: {
          mustahikId: true,
          nominal: true,
          danaMustahik: true,
          program: { select: { id: true, nama: true, pilar: true } },
        },
      }),
    ]);

    const mustahikById = new Map(mustahikList.map((m) => [m.id, m]));

    const penyaluranByMustahik = new Map<string, { nominal: number; programUtama: string }>();
    for (const row of penyaluranRows) {
      const cur = penyaluranByMustahik.get(row.mustahikId) ?? { nominal: 0, programUtama: row.program.nama };
      cur.nominal += row.danaMustahik;
      penyaluranByMustahik.set(row.mustahikId, cur);
    }

    const wilayahMap = new Map<
      string,
      { id: string; nama: string; mapTop: string; mapLeft: string; lat: number; lng: number; jiwa: number; nominal: number; programSet: Set<string> }
    >();

    for (const m of mustahikList) {
      const w = detectWilayah(m.alamat);
      const cur = wilayahMap.get(w.id) ?? {
        id: w.id,
        nama: w.nama,
        mapTop: w.mapTop,
        mapLeft: w.mapLeft,
        lat: w.lat,
        lng: w.lng,
        jiwa: 0,
        nominal: 0,
        programSet: new Set<string>(),
      };
      cur.jiwa += 1;
      const p = penyaluranByMustahik.get(m.id);
      if (p) {
        cur.nominal += p.nominal;
        cur.programSet.add(p.programUtama);
      }
      wilayahMap.set(w.id, cur);
    }

    const wilayah = [...wilayahMap.values()]
      .map((w) => ({
        id: w.id,
        nama: w.nama,
        mapTop: w.mapTop,
        mapLeft: w.mapLeft,
        lat: w.lat,
        lng: w.lng,
        jiwa: w.jiwa,
        nominal: w.nominal,
        program: [...w.programSet].slice(0, 2).join(' & ') || 'Program ZIS',
      }))
      .sort((a, b) => b.nominal - a.nominal);

    const mustahikPoints = mustahikList.map((m) => {
      const coords = resolveMustahikCoords(m.alamat, m.lat, m.lng, m.nik);
      const p = penyaluranByMustahik.get(m.id);
      return {
        id: m.id,
        nama: m.nama,
        asnaf: m.kategoriAsnaf,
        alamat: m.alamat,
        lat: coords.lat,
        lng: coords.lng,
        nominal: p?.nominal ?? 0,
        program: p?.programUtama ?? 'Belum ada penyaluran',
      };
    });

    /** Agregat per program — koordinat = centroid penerima manfaat program */
    const programMap = new Map<
      string,
      {
        id: string;
        nama: string;
        pilar: string;
        nominal: number;
        mustahikIds: Set<string>;
        latSum: number;
        lngSum: number;
        coordCount: number;
        wilayahSet: Set<string>;
      }
    >();

    for (const row of penyaluranRows) {
      const prog = row.program;
      const cur = programMap.get(prog.id) ?? {
        id: prog.id,
        nama: prog.nama,
        pilar: prog.pilar,
        nominal: 0,
        mustahikIds: new Set<string>(),
        latSum: 0,
        lngSum: 0,
        coordCount: 0,
        wilayahSet: new Set<string>(),
      };
      cur.nominal += row.danaMustahik;
      if (!cur.mustahikIds.has(row.mustahikId)) {
        cur.mustahikIds.add(row.mustahikId);
        const m = mustahikById.get(row.mustahikId);
        if (m) {
          const coords = resolveMustahikCoords(m.alamat, m.lat, m.lng, m.nik);
          cur.latSum += coords.lat;
          cur.lngSum += coords.lng;
          cur.coordCount += 1;
          cur.wilayahSet.add(detectWilayah(m.alamat).nama.split('(')[0].trim());
        }
      }
      programMap.set(prog.id, cur);
    }

    const programPoints = [...programMap.values()]
      .map((p) => {
        const lat =
          p.coordCount > 0
            ? Math.round((p.latSum / p.coordCount) * 1_000_000) / 1_000_000
            : -6.2;
        const lng =
          p.coordCount > 0
            ? Math.round((p.lngSum / p.coordCount) * 1_000_000) / 1_000_000
            : 106.8;
        return {
          id: p.id,
          nama: p.nama,
          pilar: p.pilar,
          lat,
          lng,
          jiwa: p.mustahikIds.size,
          nominal: p.nominal,
          wilayah: [...p.wilayahSet].slice(0, 3).join(', ') || 'Berbagai wilayah',
        };
      })
      .sort((a, b) => b.nominal - a.nominal);

    return {
      totalMustahik: mustahikList.length,
      totalWilayah: wilayah.length,
      totalProgram: programPoints.length,
      lastUpdated: new Date().toISOString().slice(0, 10),
      wilayah,
      mustahikPoints,
      programPoints,
    };
  }

  static async getDampak() {
    const [programs, mustahikList, penyaluranRows] = await Promise.all([
      prisma.programZis.findMany({ orderBy: { terpakai: 'desc' } }),
      prisma.mustahik.findMany({
        where: { ...activeOnly, statusSurvei: 'Terverifikasi' },
        select: {
          id: true,
          kategoriAsnaf: true,
          skorKelayakan: true,
          totalBantuanDiterima: true,
          jumlahTanggungan: true,
        },
      }),
      prisma.transaksiPenyaluran.findMany({
        where: { status: 'Sudah Tersalurkan' },
        select: { asnaf: true, danaMustahik: true },
      }),
    ]);

    const paguTotal = programs.reduce((s, p) => s + p.paguAnggaran, 0);
    const terpakaiTotal = programs.reduce((s, p) => s + p.terpakai, 0);
    const targetPenerima = programs.reduce((s, p) => s + p.targetPenerima, 0);
    const realisasiPenerima = programs.reduce((s, p) => s + p.realisasiPenerima, 0);
    const totalBantuan = mustahikList.reduce((s, m) => s + m.totalBantuanDiterima, 0);
    const avgSkor =
      mustahikList.length > 0
        ? Math.round(mustahikList.reduce((s, m) => s + m.skorKelayakan, 0) / mustahikList.length)
        : 0;
    const totalTanggungan = mustahikList.reduce((s, m) => s + m.jumlahTanggungan, 0);

    const asnafMap = new Map<string, number>();
    for (const row of penyaluranRows) {
      const label = asnafLabel(row.asnaf);
      asnafMap.set(label, (asnafMap.get(label) ?? 0) + row.danaMustahik);
    }

    const alokasiAsnaf = [...asnafMap.entries()]
      .map(([nama, nominal]) => ({ nama, nominal }))
      .sort((a, b) => b.nominal - a.nominal);

    const programRealisasi = programs.map((p) => ({
      id: p.id,
      nama: p.nama,
      pilar: p.pilar,
      paguAnggaran: p.paguAnggaran,
      terpakai: p.terpakai,
      serapanPct: p.paguAnggaran > 0 ? Math.round((p.terpakai / p.paguAnggaran) * 100) : 0,
      targetPenerima: p.targetPenerima,
      realisasiPenerima: p.realisasiPenerima,
      capaianPenerimaPct:
        p.targetPenerima > 0 ? Math.round((p.realisasiPenerima / p.targetPenerima) * 100) : 0,
    }));

    return {
      summary: {
        mustahikTerverifikasi: mustahikList.length,
        totalBantuanDisalurkan: totalBantuan,
        totalTanggunganTerbantu: totalTanggungan,
        rataSkorKelayakan: avgSkor,
        serapanAnggaranPct: paguTotal > 0 ? Math.round((terpakaiTotal / paguTotal) * 100) : 0,
        paguTotal,
        terpakaiTotal,
        capaianPenerimaPct:
          targetPenerima > 0 ? Math.round((realisasiPenerima / targetPenerima) * 100) : 0,
        targetPenerima,
        realisasiPenerima,
      },
      alokasiAsnaf,
      programRealisasi,
    };
  }
}
