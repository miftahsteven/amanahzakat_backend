const WILAYAH_LABELS = [
  { nama: 'DKI Jakarta', keywords: ['jakarta', 'kebayoran', 'jatinegara', 'pondok labu', 'menteng'] },
  { nama: 'Banten', keywords: ['tangerang', 'serang', 'banten', 'cikupa', 'lebak'] },
  { nama: 'NTB / NTT', keywords: ['lombok', 'sumbawa', 'ntb', 'ntt', 'mataram', 'dompu', 'sumba'] },
  { nama: 'Jawa Barat', keywords: ['bandung', 'bekasi', 'bogor', 'depok', 'cileunyi', 'bojongsoang', 'arcamanik', 'jawa barat'] },
] as const;

export function detectWilayahNama(alamat: string): string {
  const lower = alamat.toLowerCase();
  for (const rule of WILAYAH_LABELS) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.nama;
  }
  return 'Wilayah Lainnya';
}

const WILAYAH_RULES = [
  { id: 'dki', lat: -6.2088, lng: 106.8456, keywords: ['jakarta', 'kebayoran', 'jatinegara', 'pondok labu', 'menteng'] },
  { id: 'banten', lat: -6.4058, lng: 106.064, keywords: ['tangerang', 'serang', 'banten', 'cikupa', 'lebak'] },
  { id: 'ntb', lat: -8.5833, lng: 116.1167, keywords: ['lombok', 'sumbawa', 'ntb', 'ntt', 'mataram', 'dompu'] },
  {
    id: 'jabar',
    lat: -6.9175,
    lng: 107.6191,
    keywords: ['bandung', 'bekasi', 'bogor', 'depok', 'cileunyi', 'bojongsoang', 'arcamanik', 'jawa barat'],
  },
] as const;

const DEFAULT_COORD = { lat: -2.5489, lng: 118.0149 };

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function isValidIndonesiaCoord(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141;
}

export function detectWilayahBase(alamat: string): { lat: number; lng: number } {
  const lower = alamat.toLowerCase();
  for (const rule of WILAYAH_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return { lat: rule.lat, lng: rule.lng };
    }
  }
  return DEFAULT_COORD;
}

/** Estimasi koordinat dari alamat + jitter kecil agar marker mustahik tidak bertumpuk */
export function coordsFromAlamat(alamat: string, seed = alamat): { lat: number; lng: number } {
  const base = detectWilayahBase(alamat);
  const hash = hashSeed(seed);
  const jitterLat = ((hash % 1000) / 1000 - 0.5) * 0.22;
  const jitterLng = (((hash >> 10) % 1000) / 1000 - 0.5) * 0.22;
  return {
    lat: Math.round((base.lat + jitterLat) * 1_000_000) / 1_000_000,
    lng: Math.round((base.lng + jitterLng) * 1_000_000) / 1_000_000,
  };
}

export function resolveMustahikCoords(
  alamat: string,
  lat?: number | null,
  lng?: number | null,
  seed?: string
): { lat: number; lng: number } {
  const latNum = lat != null ? Number(lat) : NaN;
  const lngNum = lng != null ? Number(lng) : NaN;
  if (isValidIndonesiaCoord(latNum, lngNum)) {
    return { lat: latNum, lng: lngNum };
  }
  return coordsFromAlamat(alamat, seed);
}
