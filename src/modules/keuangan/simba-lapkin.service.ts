import { prisma } from '../../lib/prisma';
import { activeOnly } from '../../lib/soft-delete';

export type SimbaHalKode =
  | 'HAL_2_PENGUMPULAN'
  | 'HAL_3_MUZAKI'
  | 'HAL_4_PENYALURAN'
  | 'HAL_5_MUSTAHIK'
  | 'HAL_6_TATA_KELOLA'
  | 'HAL_7_OFF_BALANCE'
  | 'HAL_8_DUKUNGAN_PEMDA';

export const SIMBA_HALAMAN: Array<{
  kodeForm: SimbaHalKode;
  no: number;
  namaForm: string;
  sumber: 'auto' | 'manual';
}> = [
  { kodeForm: 'HAL_2_PENGUMPULAN', no: 2, namaForm: 'Hal 2 - Pengumpulan', sumber: 'auto' },
  { kodeForm: 'HAL_3_MUZAKI', no: 3, namaForm: 'Hal 3 - Muzaki', sumber: 'auto' },
  { kodeForm: 'HAL_4_PENYALURAN', no: 4, namaForm: 'Hal 4 - Penyaluran', sumber: 'auto' },
  { kodeForm: 'HAL_5_MUSTAHIK', no: 5, namaForm: 'Hal 5 - Mustahik', sumber: 'auto' },
  { kodeForm: 'HAL_6_TATA_KELOLA', no: 6, namaForm: 'Hal 6 - Tata Kelola', sumber: 'manual' },
  { kodeForm: 'HAL_7_OFF_BALANCE', no: 7, namaForm: 'Hal 7 - Off Balance Sheet', sumber: 'manual' },
  { kodeForm: 'HAL_8_DUKUNGAN_PEMDA', no: 8, namaForm: 'Hal 8 - Dukungan Pemerintah', sumber: 'manual' },
];

const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export type SimbaRow = {
  kode: string;
  label: string;
  current: number;
  previous: number;
  unit?: 'rp' | 'count' | 'ekor';
  indent?: number;
  isTotal?: boolean;
};

export type SimbaSection = {
  title: string;
  rows: SimbaRow[];
};

function parsePeriod(periode: string): { year: number; month: number; label: string; dari: string; sampai: string } {
  const m = /^(\d{4})-(\d{2})$/.exec(periode.trim());
  if (!m) throw { statusCode: 400, message: 'Periode harus berformat YYYY-MM.' };
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  if (month < 1 || month > 12) throw { statusCode: 400, message: 'Bulan periode tidak valid.' };
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  return {
    year,
    month,
    label: `${BULAN[month - 1]} ${year}`,
    dari: `${year}-${mm}-01`,
    sampai: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

/** Normalize stored tanggal string to YYYY-MM-DD when possible. */
export function normalizeTanggal(tanggal: string): string {
  if (!tanggal) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(tanggal)) return tanggal.slice(0, 10);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(tanggal)) {
    const [d, m, y] = tanggal.split('/');
    return `${y}-${m}-${d}`;
  }
  const d = new Date(tanggal);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return tanggal;
}

function inRange(tanggal: string, dari: string, sampai: string): boolean {
  const t = normalizeTanggal(tanggal);
  return t >= dari && t <= sampai;
}

function mapPilarToBidang(pilar: string): string {
  const p = (pilar || '').toLowerCase();
  if (p.includes('kemanusiaan') || p.includes('sosial')) return 'Kemanusiaan';
  if (p.includes('kesehatan')) return 'Kesehatan';
  if (p.includes('pendidikan')) return 'Pendidikan';
  if (p.includes('ekonomi')) return 'Ekonomi';
  if (p.includes('dakwah') || p.includes('advokasi')) return 'Dakwah-Advokasi';
  return 'Kemanusiaan';
}

function isZakatMaalLike(jenis: string): boolean {
  const j = jenis.toLowerCase();
  return (j.includes('zakat') || j.includes('profesi')) && !j.includes('fitrah');
}

function isIndividu(tipe: string): boolean {
  return tipe === 'Perorangan';
}

function row(kode: string, label: string, current: number, previous: number, opts?: Partial<SimbaRow>): SimbaRow {
  return { kode, label, current, previous, unit: 'rp', indent: 0, ...opts };
}

async function ensureSimbaForms() {
  for (const h of SIMBA_HALAMAN) {
    await prisma.formSimba.upsert({
      where: { kodeForm: h.kodeForm },
      update: { namaForm: h.namaForm },
      create: {
        kodeForm: h.kodeForm,
        namaForm: h.namaForm,
        status: h.sumber === 'auto' ? 'Siap Kirim' : 'Draft',
        itemCount: 0,
        totalNilai: 0,
      },
    });
  }
  // Soft-hide legacy FORM_* by leaving them; list will only return HAL_*
}

type PenerimaanRow = Awaited<ReturnType<typeof loadPenerimaan>>[number];
type PenyaluranRow = Awaited<ReturnType<typeof loadPenyaluran>>[number];

async function loadPenerimaan() {
  return prisma.transaksiPenerimaan.findMany({
    where: { status: 'Terverifikasi' },
    include: { muzakki: true },
  });
}

async function loadPenyaluran() {
  return prisma.transaksiPenyaluran.findMany({
    where: { status: 'Sudah Tersalurkan' },
    include: { program: true, mustahik: true },
  });
}

function filterPenerimaan(rows: PenerimaanRow[], dari: string, sampai: string) {
  return rows.filter((r) => inRange(r.tanggal, dari, sampai));
}

function filterPenyaluran(rows: PenyaluranRow[], dari: string, sampai: string) {
  return rows.filter((r) => inRange(r.tanggal, dari, sampai));
}

function sum(rows: { nominal: number }[]) {
  return rows.reduce((s, r) => s + r.nominal, 0);
}

function buildPengumpulan(curr: PenerimaanRow[], prev: PenerimaanRow[]): SimbaSection[] {
  const bucket = (rows: PenerimaanRow[]) => {
    const maalPerorangan = rows.filter(
      (r) => isZakatMaalLike(r.jenisZis) && isIndividu(r.muzakki.tipe),
    );
    const maalBadan = rows.filter(
      (r) => isZakatMaalLike(r.jenisZis) && !isIndividu(r.muzakki.tipe),
    );
    const fitrah = rows.filter((r) => r.jenisZis.toLowerCase().includes('fitrah'));
    const infakTidakTerikat = rows.filter(
      (r) =>
        (r.jenisZis === 'Infak' || r.jenisZis === 'Shodaqoh') && !r.programNama,
    );
    const infakTerikat = rows.filter(
      (r) => r.jenisZis === 'Infak' && !!r.programNama,
    );
    const csr = rows.filter((r) => r.jenisZis.toLowerCase().includes('csr'));
    const kurban = rows.filter((r) => r.jenisZis.toLowerCase().includes('kurban'));
    const fidyah = rows.filter((r) => r.jenisZis.toLowerCase().includes('fidyah'));
    const wakaf = rows.filter((r) => r.jenisZis.toLowerCase().includes('wakaf'));

    const zakat = sum(maalPerorangan) + sum(maalBadan) + sum(fitrah);
    const infak = sum(infakTidakTerikat) + sum(infakTerikat);
    const csrTotal = sum(csr);
    const dskl = sum(kurban) + sum(fidyah) + sum(wakaf);

    return {
      maalPerorangan: sum(maalPerorangan),
      maalBadan: sum(maalBadan),
      fitrah: sum(fitrah),
      zakat,
      infakTidakTerikat: sum(infakTidakTerikat),
      infakTerikat: sum(infakTerikat),
      infak,
      csr: csrTotal,
      kurban: sum(kurban),
      fidyah: sum(fidyah),
      dskLain: sum(wakaf),
      dskl,
      total: zakat + infak + csrTotal + dskl,
      trxCount: rows.length,
    };
  };

  const c = bucket(curr);
  const p = bucket(prev);

  return [
    {
      title: 'PENGUMPULAN ZIS-DSKL',
      rows: [
        row('1', 'ZAKAT', c.zakat, p.zakat, { indent: 0, isTotal: true }),
        row('1.1', 'Zakat Maal Perorangan', c.maalPerorangan, p.maalPerorangan, { indent: 1 }),
        row('1.3', 'Zakat Maal Badan', c.maalBadan, p.maalBadan, { indent: 1 }),
        row('1.4', 'Zakat Fitrah', c.fitrah, p.fitrah, { indent: 1 }),
        row('2', 'INFAK/SEDEKAH', c.infak, p.infak, { indent: 0, isTotal: true }),
        row('2.1', 'Infak/Sedekah Tidak Terikat', c.infakTidakTerikat, p.infakTidakTerikat, { indent: 1 }),
        row('2.3', 'Infak/Sedekah Terikat', c.infakTerikat, p.infakTerikat, { indent: 1 }),
        row('2.5', 'Infak Penyaluran', 0, 0, { indent: 1 }),
        row('2.6', 'Infak Operasional', 0, 0, { indent: 1 }),
        row('3', 'CORPORATE SOCIAL RESPONSIBILITY', c.csr, p.csr, { indent: 0, isTotal: true }),
        row('3.1', 'Corporate Social Responsibility', c.csr, p.csr, { indent: 1 }),
        row('4', 'DANA SOSIAL KEAGAMAAN LAINNYA', c.dskl, p.dskl, { indent: 0, isTotal: true }),
        row('4.1', 'Kurban', c.kurban, p.kurban, { indent: 1 }),
        row('4.3', 'Fidyah', c.fidyah, p.fidyah, { indent: 1 }),
        row('4.5', 'DSK Lainnya', c.dskLain, p.dskLain, { indent: 1 }),
        row('T', 'TOTAL', c.total, p.total, { indent: 0, isTotal: true }),
      ],
    },
    {
      title: 'Dana Titipan',
      rows: [row('1', 'Dana Titipan', 0, 0)],
    },
  ];
}

function buildMuzaki(curr: PenerimaanRow[], prev: PenerimaanRow[]): SimbaSection[] {
  const count = (rows: PenerimaanRow[], pred: (r: PenerimaanRow) => boolean) => {
    const ids = new Set(rows.filter(pred).map((r) => r.muzakkiId));
    return ids.size;
  };

  const metrics = (rows: PenerimaanRow[]) => {
    const maalIndividu = count(
      rows,
      (r) => isZakatMaalLike(r.jenisZis) && isIndividu(r.muzakki.tipe),
    );
    const fitrahIndividu = count(
      rows,
      (r) => r.jenisZis.toLowerCase().includes('fitrah') && isIndividu(r.muzakki.tipe),
    );
    const munfikIndividu = count(
      rows,
      (r) =>
        (r.jenisZis === 'Infak' || r.jenisZis === 'Shodaqoh') && isIndividu(r.muzakki.tipe),
    );
    const maalBadan = count(
      rows,
      (r) => isZakatMaalLike(r.jenisZis) && !isIndividu(r.muzakki.tipe),
    );
    const munfikBadan = count(
      rows,
      (r) =>
        (r.jenisZis === 'Infak' || r.jenisZis === 'Shodaqoh') && !isIndividu(r.muzakki.tipe),
    );
    const csrBadan = count(
      rows,
      (r) => r.jenisZis.toLowerCase().includes('csr') && !isIndividu(r.muzakki.tipe),
    );
    return {
      maalIndividu,
      fitrahIndividu,
      muzakiIndividu: maalIndividu + fitrahIndividu,
      munfikIndividu,
      maalBadan,
      munfikBadan,
      csrBadan,
    };
  };

  const c = metrics(curr);
  const p = metrics(prev);
  const opts = { unit: 'count' as const };

  return [
    {
      title: 'MUZAKI INDIVIDU',
      rows: [
        row('1', 'MUZAKI INDIVIDU', c.muzakiIndividu, p.muzakiIndividu, { ...opts, isTotal: true }),
        row('1.1', 'Muzaki Maal Individu', c.maalIndividu, p.maalIndividu, { ...opts, indent: 1 }),
        row('1.2', 'Muzaki Fitrah Individu', c.fitrahIndividu, p.fitrahIndividu, { ...opts, indent: 1 }),
        row('2', 'MUNFIK INDIVIDU', c.munfikIndividu, p.munfikIndividu, { ...opts, isTotal: true }),
        row('2.1', 'Munfik Individu', c.munfikIndividu, p.munfikIndividu, { ...opts, indent: 1 }),
        row('2.2', 'Mudhohi (Pembayar Qurban)', 0, 0, { ...opts, indent: 1 }),
        row('2.3', 'Pembayar Fidyah', 0, 0, { ...opts, indent: 1 }),
        row('2.4', 'Pembayar DSKL', 0, 0, { ...opts, indent: 1 }),
      ],
    },
    {
      title: 'MUZAKI BADAN',
      rows: [
        row('1', 'MUZAKI BADAN', c.maalBadan, p.maalBadan, { ...opts, isTotal: true }),
        row('1.1', 'Muzaki Badan', c.maalBadan, p.maalBadan, { ...opts, indent: 1 }),
        row('2', 'MUNFIK BADAN', c.munfikBadan + c.csrBadan, p.munfikBadan + p.csrBadan, {
          ...opts,
          isTotal: true,
        }),
        row('2.1', 'Munfik Badan', c.munfikBadan, p.munfikBadan, { ...opts, indent: 1 }),
        row('2.2', 'Pembayar CSR/TJSL', c.csrBadan, p.csrBadan, { ...opts, indent: 1 }),
      ],
    },
  ];
}

function buildPenyaluran(curr: PenyaluranRow[], prev: PenyaluranRow[]): SimbaSection[] {
  const ASNAF = [
    'Fakir',
    'Miskin',
    'Amil',
    'Mualaf',
    'Riqab',
    'Gharim',
    'Fisabilillah',
    'Ibnus Sabil',
  ] as const;

  const asnafKey = (a: string) => {
    const x = a.toLowerCase();
    if (x.includes('fakir')) return 'Fakir';
    if (x.includes('miskin')) return 'Miskin';
    if (x.includes('amil')) return 'Amil';
    if (x.includes('mualaf') || x.includes('muallaf')) return 'Mualaf';
    if (x.includes('riqab')) return 'Riqab';
    if (x.includes('gharim')) return 'Gharim';
    if (x.includes('sabilillah') || x.includes('fisabilillah')) return 'Fisabilillah';
    if (x.includes('ibnu')) return 'Ibnus Sabil';
    return a;
  };

  const byAsnaf = (rows: PenyaluranRow[]) => {
    const map: Record<string, number> = Object.fromEntries(ASNAF.map((a) => [a, 0]));
    for (const r of rows) {
      const k = asnafKey(r.asnaf);
      if (map[k] !== undefined) map[k] += r.nominal;
      else map[k] = (map[k] || 0) + r.nominal;
    }
    const total = Object.values(map).reduce((s, n) => s + n, 0);
    const amilFromPotongan = rows.reduce((s, r) => s + (r.potonganAmil || 0), 0);
    return { map, total, amilFromPotongan };
  };

  const byBidang = (rows: PenyaluranRow[]) => {
    const bidang = ['Kemanusiaan', 'Kesehatan', 'Pendidikan', 'Ekonomi', 'Dakwah-Advokasi'];
    const map: Record<string, number> = Object.fromEntries(bidang.map((b) => [b, 0]));
    for (const r of rows) {
      const b = mapPilarToBidang(r.program?.pilar || '');
      map[b] = (map[b] || 0) + r.danaMustahik;
    }
    return { map, total: Object.values(map).reduce((s, n) => s + n, 0) };
  };

  const c = byAsnaf(curr);
  const p = byAsnaf(prev);
  const cb = byBidang(curr);
  const pb = byBidang(prev);

  const asnafLabels: Record<(typeof ASNAF)[number], string> = {
    Fakir: '1.1 Penyaluran Dana Zakat Maal untuk Fakir',
    Miskin: '1.2 Penyaluran Dana Zakat Maal untuk Miskin',
    Amil: '1.3 Penyaluran Dana Zakat Maal untuk Amil',
    Mualaf: '1.4 Penyaluran Dana Zakat Maal untuk Muallaf',
    Riqab: '1.5 Penyaluran Dana Zakat Maal untuk Riqab',
    Gharim: '1.6 Penyaluran Dana Zakat Maal untuk Gharim',
    Fisabilillah: '1.7 Penyaluran Dana Zakat Maal untuk Sabilillah',
    'Ibnus Sabil': '1.8 Penyaluran Dana Zakat Maal untuk Ibnu Sabil',
  };

  const amilOps = c.amilFromPotongan || c.map.Amil || 0;
  const amilOpsPrev = p.amilFromPotongan || p.map.Amil || 0;

  return [
    {
      title: 'PENYALURAN BERDASARKAN JENIS DANA DAN ASNAF',
      rows: [
        row('1', 'PENYALURAN DANA ZAKAT MAAL', c.total, p.total, { isTotal: true }),
        ...ASNAF.map((a, i) =>
          row(`1.${i + 1}`, asnafLabels[a], c.map[a] || 0, p.map[a] || 0, { indent: 1 }),
        ),
        row('2', 'PENYALURAN DANA ZAKAT FITRAH', 0, 0, { isTotal: true }),
        row('3', 'PENYALURAN DANA INFAK/SEDEKAH', 0, 0, { isTotal: true }),
        row('T', 'TOTAL PENYALURAN ASNAF', c.total, p.total, { isTotal: true }),
      ],
    },
    {
      title: 'PENYALURAN HEWAN KURBAN',
      rows: [
        row('1', 'Sapi/Kerbau', 0, 0, { unit: 'ekor' }),
        row('2', 'Domba/Kambing', 0, 0, { unit: 'ekor' }),
        row('T', 'TOTAL PENYALURAN HEWAN KURBAN', 0, 0, { unit: 'ekor', isTotal: true }),
      ],
    },
    {
      title: 'PENYALURAN BERDASARKAN BIDANG PROGRAM',
      rows: [
        row('1', 'Bidang Kemanusiaan', cb.map.Kemanusiaan, pb.map.Kemanusiaan),
        row('2', 'Bidang Kesehatan', cb.map.Kesehatan, pb.map.Kesehatan),
        row('3', 'Bidang Pendidikan', cb.map.Pendidikan, pb.map.Pendidikan),
        row('4', 'Bidang Ekonomi', cb.map.Ekonomi, pb.map.Ekonomi),
        row('5', 'Bidang Dakwah-Advokasi', cb.map['Dakwah-Advokasi'], pb.map['Dakwah-Advokasi']),
        row('T', 'TOTAL PENYALURAN BERDASARKAN BIDANG PROGRAM', cb.total, pb.total, {
          isTotal: true,
        }),
      ],
    },
    {
      title: 'PENYALURAN OPERASIONAL',
      rows: [
        row('1', 'Belanja Operasional SDM/Belanja Pegawai', Math.round(amilOps * 0.4), Math.round(amilOpsPrev * 0.4)),
        row('2', 'Belanja Operasional Non SDM', Math.round(amilOps * 0.6), Math.round(amilOpsPrev * 0.6)),
        row('T', 'TOTAL PENYALURAN OPERASIONAL', amilOps, amilOpsPrev, { isTotal: true }),
      ],
    },
    {
      title: 'PENGGUNAAN APBN/APBD',
      rows: [
        row('1', 'Penggunaan APBN/APBD untuk Operasional', 0, 0, { isTotal: true }),
        row('2', 'Penggunaan APBN/APBD untuk Penyaluran (non-Amil)', 0, 0, { isTotal: true }),
        row('T', 'TOTAL PENGGUNAAN APBN/APBD', 0, 0, { isTotal: true }),
      ],
    },
  ];
}

function buildMustahik(curr: PenyaluranRow[], prev: PenyaluranRow[]): SimbaSection[] {
  const countByBidang = (rows: PenyaluranRow[]) => {
    const bidang = ['Kemanusiaan', 'Kesehatan', 'Pendidikan', 'Ekonomi', 'Dakwah-Advokasi'];
    const map: Record<string, Set<string>> = Object.fromEntries(bidang.map((b) => [b, new Set()]));
    for (const r of rows) {
      const b = mapPilarToBidang(r.program?.pilar || '');
      map[b]?.add(r.mustahikId);
    }
    const counts = Object.fromEntries(bidang.map((b) => [b, map[b].size]));
    const total = new Set(rows.map((r) => r.mustahikId)).size;
    return { counts, total };
  };

  const c = countByBidang(curr);
  const p = countByBidang(prev);
  const opts = { unit: 'count' as const };

  return [
    {
      title: 'MUSTAHIK PER BIDANG PROGRAM',
      rows: [
        row('1', 'Bidang Kemanusiaan', c.counts.Kemanusiaan, p.counts.Kemanusiaan, opts),
        row('2', 'Bidang Kesehatan', c.counts.Kesehatan, p.counts.Kesehatan, opts),
        row('3', 'Bidang Pendidikan', c.counts.Pendidikan, p.counts.Pendidikan, opts),
        row('4', 'Bidang Ekonomi', c.counts.Ekonomi, p.counts.Ekonomi, opts),
        row('5', 'Bidang Dakwah-Advokasi', c.counts['Dakwah-Advokasi'], p.counts['Dakwah-Advokasi'], opts),
        row('T', 'TOTAL', c.total, p.total, { ...opts, isTotal: true }),
      ],
    },
    {
      title: 'DATA INDIKATOR KINERJA KUNCI PENYALURAN NASIONAL',
      rows: [
        row('1', 'Data Peningkatan Kualitas Kesejahteraan Ekonomi', 0, 0, {
          ...opts,
          isTotal: true,
        }),
        row('1.1', 'Jumlah Mustahik Penerima Pendistribusian', c.total, p.total, {
          ...opts,
          indent: 1,
        }),
        row('1.2', 'Jumlah Mustahik Penerima Pendayagunaan', 0, 0, { ...opts, indent: 1 }),
        row('1.3', 'Jumlah Mustahik dengan NRM SiMBA', 0, 0, { ...opts, indent: 1 }),
        row('2', 'Realisasi Program Prioritas Nasional', 0, 0, { ...opts, isTotal: true }),
        row('2.11', 'Jumlah Mustahik Penerima Penyaluran Beasiswa', 0, 0, {
          ...opts,
          indent: 1,
        }),
        row('2.13', 'Jumlah Desa/Kampung Zakat', 0, 0, { ...opts, indent: 1 }),
      ],
    },
  ];
}

function placeholderSections(title: string, note: string): SimbaSection[] {
  return [
    {
      title,
      rows: [
        row('N', note, 0, 0, { unit: 'count', isTotal: true }),
      ],
    },
  ];
}

function summaryFromSections(sections: SimbaSection[]): { itemCount: number; totalNilai: number } {
  let itemCount = 0;
  let totalNilai = 0;
  for (const s of sections) {
    for (const r of s.rows) {
      if (r.isTotal && r.unit === 'rp') totalNilai = Math.max(totalNilai, r.current);
      if (r.isTotal && r.unit === 'count') itemCount = Math.max(itemCount, r.current);
      if (!r.isTotal && r.unit === 'count') itemCount += 0;
    }
  }
  if (itemCount === 0) {
    itemCount = sections.reduce((n, s) => n + s.rows.filter((r) => !r.isTotal).length, 0);
  }
  return { itemCount, totalNilai };
}

export class SimbaLapkinService {
  static async list(periode?: string) {
    await ensureSimbaForms();
    const now = new Date();
    const periodeKey =
      periode || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const meta = parsePeriod(periodeKey);
    const prevDari = `${meta.year - 1}-${String(meta.month).padStart(2, '0')}-01`;
    const prevLast = new Date(meta.year - 1, meta.month, 0).getDate();
    const prevSampai = `${meta.year - 1}-${String(meta.month).padStart(2, '0')}-${String(prevLast).padStart(2, '0')}`;

    const [forms, penerimaan, penyaluran] = await Promise.all([
      prisma.formSimba.findMany({
        where: { kodeForm: { in: SIMBA_HALAMAN.map((h) => h.kodeForm) } },
        orderBy: { kodeForm: 'asc' },
      }),
      loadPenerimaan(),
      loadPenyaluran(),
    ]);

    const currP = filterPenerimaan(penerimaan, meta.dari, meta.sampai);
    const prevP = filterPenerimaan(penerimaan, prevDari, prevSampai);
    const currS = filterPenyaluran(penyaluran, meta.dari, meta.sampai);
    const prevS = filterPenyaluran(penyaluran, prevDari, prevSampai);

    const live: Record<string, { itemCount: number; totalNilai: number; status: string }> = {
      HAL_2_PENGUMPULAN: {
        ...summaryFromSections(buildPengumpulan(currP, prevP)),
        itemCount: currP.length,
        status: currP.length ? 'Siap Kirim' : 'Draft',
      },
      HAL_3_MUZAKI: {
        itemCount: new Set(currP.map((r) => r.muzakkiId)).size,
        totalNilai: 0,
        status: currP.length ? 'Siap Kirim' : 'Draft',
      },
      HAL_4_PENYALURAN: {
        itemCount: currS.length,
        totalNilai: sum(currS),
        status: currS.length ? 'Siap Kirim' : 'Draft',
      },
      HAL_5_MUSTAHIK: {
        itemCount: new Set(currS.map((r) => r.mustahikId)).size,
        totalNilai: 0,
        status: currS.length ? 'Siap Kirim' : 'Draft',
      },
      HAL_6_TATA_KELOLA: { itemCount: 0, totalNilai: 0, status: 'Draft' },
      HAL_7_OFF_BALANCE: { itemCount: 0, totalNilai: 0, status: 'Draft' },
      HAL_8_DUKUNGAN_PEMDA: { itemCount: 0, totalNilai: 0, status: 'Draft' },
    };

    const ordered = SIMBA_HALAMAN.map((h) => {
      const f = forms.find((x) => x.kodeForm === h.kodeForm);
      const liveRow = live[h.kodeForm];
      return {
        id: f?.id || h.kodeForm,
        kodeForm: h.kodeForm,
        no: h.no,
        namaForm: h.namaForm,
        sumber: h.sumber,
        status: liveRow?.status || f?.status || 'Draft',
        itemCount: liveRow?.itemCount ?? 0,
        totalNilai: liveRow?.totalNilai ?? 0,
        koreksi: 0,
        tanggalSimpan: f?.updatedAt?.toISOString() || null,
      };
    });

    return {
      periode: {
        key: periodeKey,
        label: meta.label,
        dari: meta.dari,
        sampai: meta.sampai,
        previousLabel: `${BULAN[meta.month - 1]} ${meta.year - 1}`,
      },
      pages: ordered,
    };
  }

  static async detail(kodeForm: string, periode?: string) {
    await ensureSimbaForms();
    const def = SIMBA_HALAMAN.find((h) => h.kodeForm === kodeForm);
    if (!def) throw { statusCode: 404, message: 'Halaman SIMBA tidak ditemukan.' };

    const now = new Date();
    const periodeKey =
      periode || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const meta = parsePeriod(periodeKey);
    const prevDari = `${meta.year - 1}-${String(meta.month).padStart(2, '0')}-01`;
    const prevLast = new Date(meta.year - 1, meta.month, 0).getDate();
    const prevSampai = `${meta.year - 1}-${String(meta.month).padStart(2, '0')}-${String(prevLast).padStart(2, '0')}`;

    const [penerimaan, penyaluran, form] = await Promise.all([
      loadPenerimaan(),
      loadPenyaluran(),
      prisma.formSimba.findUnique({ where: { kodeForm } }),
    ]);

    const currP = filterPenerimaan(penerimaan, meta.dari, meta.sampai);
    const prevP = filterPenerimaan(penerimaan, prevDari, prevSampai);
    const currS = filterPenyaluran(penyaluran, meta.dari, meta.sampai);
    const prevS = filterPenyaluran(penyaluran, prevDari, prevSampai);

    let sections: SimbaSection[] = [];
    switch (kodeForm as SimbaHalKode) {
      case 'HAL_2_PENGUMPULAN':
        sections = buildPengumpulan(currP, prevP);
        break;
      case 'HAL_3_MUZAKI':
        sections = buildMuzaki(currP, prevP);
        break;
      case 'HAL_4_PENYALURAN':
        sections = buildPenyaluran(currS, prevS);
        break;
      case 'HAL_5_MUSTAHIK':
        sections = buildMustahik(currS, prevS);
        break;
      case 'HAL_6_TATA_KELOLA':
        sections = placeholderSections(
          'DATA TATA KELOLA',
          'Data tata kelola diisi manual di SIMBA (pimpinan, SDM, kebijakan, target RKAT).',
        );
        break;
      case 'HAL_7_OFF_BALANCE':
        sections = placeholderSections(
          'OFF BALANCE SHEET',
          'Belum ada flag transaksi off-balance di ERP — isi manual atau aktifkan pencatatan khusus.',
        );
        break;
      case 'HAL_8_DUKUNGAN_PEMDA':
        sections = placeholderSections(
          'DUKUNGAN PEMERINTAH',
          'Halaman dukungan pemerintah belum tersedia di template PDF — isi manual di SIMBA.',
        );
        break;
    }

    return {
      kodeForm,
      no: def.no,
      namaForm: def.namaForm,
      sumber: def.sumber,
      status: form?.status || 'Draft',
      periode: {
        key: periodeKey,
        label: meta.label,
        dari: meta.dari,
        sampai: meta.sampai,
        previousLabel: `${BULAN[meta.month - 1]} ${meta.year - 1}`,
        currentYear: String(meta.year),
        previousYear: String(meta.year - 1),
        monthName: BULAN[meta.month - 1],
      },
      lembaga: {
        nama: 'AmanahZakat — LAZNAS',
        skala: 'Nasional',
      },
      sections,
    };
  }

  static async markExported(kodeForm: string) {
    const form = await prisma.formSimba.findUnique({ where: { kodeForm } });
    if (!form) throw { statusCode: 404, message: 'Form SIMBA tidak ditemukan.' };
    return prisma.formSimba.update({
      where: { kodeForm },
      data: { status: 'Siap Kirim' },
    });
  }
}
