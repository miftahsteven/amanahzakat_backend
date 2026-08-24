import { ZakatJenisHitung } from '@prisma/client';

export interface ZakatConfigParams {
  hargaEmasPerGram: number;
  hargaBerasPerKg: number;
  nisabEmasGram: number;
  nisabBerasKg: number;
  nisabPertanianKg: number;
  zakatRate: number;
  fitrahKgPerJiwa: number;
}

export interface ZakatConfigView extends ZakatConfigParams {
  id: string;
  nisabEmasNominal: number;
  nisabProfesiBulanan: number;
  fitrahNominalPerJiwa: number;
  updatedAt: string;
  updatedById?: string | null;
}

export const DEFAULT_ZAKAT_CONFIG: ZakatConfigParams = {
  hargaEmasPerGram: 1_450_000,
  hargaBerasPerKg: 15_000,
  nisabEmasGram: 85,
  nisabBerasKg: 522,
  nisabPertanianKg: 653,
  zakatRate: 0.025,
  fitrahKgPerJiwa: 2.5,
};

export function enrichZakatConfig(
  raw: ZakatConfigParams & { id: string; updatedAt: Date; updatedById?: string | null }
): ZakatConfigView {
  const nisabEmasNominal = Math.round(raw.nisabEmasGram * raw.hargaEmasPerGram);
  const nisabProfesiBulanan = Math.round((raw.nisabBerasKg * raw.hargaBerasPerKg) / 12);
  const fitrahNominalPerJiwa = Math.round(raw.fitrahKgPerJiwa * raw.hargaBerasPerKg);

  return {
    ...raw,
    nisabEmasNominal,
    nisabProfesiBulanan,
    fitrahNominalPerJiwa,
    updatedAt: raw.updatedAt.toISOString(),
  };
}

export interface ProfesiInput {
  pendapatanBulanan: number;
  bonus?: number;
  kebutuhanPokok?: number;
}

export interface MaalInput {
  tabungan: number;
  investasi: number;
  emasGram: number;
  piutangLancar?: number;
  hutangJatuhTempo?: number;
}

export interface PertanianInput {
  hasilPanenKg: number;
  hargaKg?: number;
  irigasiBerbayar?: boolean;
}

export interface FitrahInput {
  jumlahJiwa: number;
  hargaBerasKg?: number;
}

export type ZakatHitungInput =
  | { jenis: 'PROFESI'; input: ProfesiInput }
  | { jenis: 'MAAL'; input: MaalInput }
  | { jenis: 'PERTANIAN'; input: PertanianInput }
  | { jenis: 'FITRAH'; input: FitrahInput };

export interface ZakatHitungResult {
  jenis: ZakatJenisHitung;
  input: Record<string, unknown>;
  wajibZakat: boolean;
  hasilNominal: number;
  detail: Record<string, unknown>;
}

export function hitungZakatProfesi(config: ZakatConfigParams, input: ProfesiInput): ZakatHitungResult {
  const bonus = input.bonus ?? 0;
  const kebutuhanPokok = input.kebutuhanPokok ?? 0;
  const bruto = input.pendapatanBulanan + bonus;
  const totalPendapatan = kebutuhanPokok > 0 ? Math.max(0, bruto - kebutuhanPokok) : bruto;
  const nisabBulanan = Math.round((config.nisabBerasKg * config.hargaBerasPerKg) / 12);
  const wajibZakat = totalPendapatan >= nisabBulanan;
  const zakatHarusDibayar = wajibZakat ? Math.round(totalPendapatan * config.zakatRate) : 0;

  return {
    jenis: 'PROFESI',
    input: { ...input, bonus, kebutuhanPokok },
    wajibZakat,
    hasilNominal: zakatHarusDibayar,
    detail: {
      totalPendapatan,
      nisabBulanan,
      zakatHarusDibayar,
    },
  };
}

export function hitungZakatMaal(config: ZakatConfigParams, input: MaalInput): ZakatHitungResult {
  const piutangLancar = input.piutangLancar ?? 0;
  const hutangJatuhTempo = input.hutangJatuhTempo ?? 0;
  const nilaiEmas = input.emasGram * config.hargaEmasPerGram;
  const totalHarta = input.tabungan + input.investasi + nilaiEmas + piutangLancar;
  const totalHartaBersih = Math.max(0, totalHarta - hutangJatuhTempo);
  const nisabNominal = Math.round(config.nisabEmasGram * config.hargaEmasPerGram);
  const wajibZakat = totalHartaBersih >= nisabNominal;
  const zakatHarusDibayar = wajibZakat ? Math.round(totalHartaBersih * config.zakatRate) : 0;

  return {
    jenis: 'MAAL',
    input: { ...input, piutangLancar, hutangJatuhTempo },
    wajibZakat,
    hasilNominal: zakatHarusDibayar,
    detail: {
      nilaiEmas,
      totalHartaBersih,
      nisabNominal,
      zakatHarusDibayar,
    },
  };
}

export function hitungZakatPertanian(config: ZakatConfigParams, input: PertanianInput): ZakatHitungResult {
  const hargaKg = input.hargaKg ?? config.hargaBerasPerKg;
  const irigasiBerbayar = input.irigasiBerbayar ?? true;
  const totalNilai = input.hasilPanenKg * hargaKg;
  const wajibZakat = input.hasilPanenKg >= config.nisabPertanianKg;
  const pct = irigasiBerbayar ? 0.05 : 0.1;
  const zakatBerasKg = wajibZakat ? input.hasilPanenKg * pct : 0;
  const zakatNominal = wajibZakat ? Math.round(totalNilai * pct) : 0;

  return {
    jenis: 'PERTANIAN',
    input: { ...input, hargaKg, irigasiBerbayar },
    wajibZakat,
    hasilNominal: zakatNominal,
    detail: {
      totalNilai,
      nisabKg: config.nisabPertanianKg,
      zakatBerasKg,
      zakatNominal,
    },
  };
}

export function hitungZakatFitrah(config: ZakatConfigParams, input: FitrahInput): ZakatHitungResult {
  const hargaBerasKg = input.hargaBerasKg ?? config.hargaBerasPerKg;
  const totalKg = input.jumlahJiwa * config.fitrahKgPerJiwa;
  const totalNominal = Math.round(totalKg * hargaBerasKg);

  return {
    jenis: 'FITRAH',
    input: { ...input, hargaBerasKg },
    wajibZakat: input.jumlahJiwa > 0,
    hasilNominal: totalNominal,
    detail: {
      kgPerJiwa: config.fitrahKgPerJiwa,
      totalKg,
      totalNominal,
    },
  };
}

export function hitungZakat(config: ZakatConfigParams, payload: ZakatHitungInput): ZakatHitungResult {
  switch (payload.jenis) {
    case 'PROFESI':
      return hitungZakatProfesi(config, payload.input);
    case 'MAAL':
      return hitungZakatMaal(config, payload.input);
    case 'PERTANIAN':
      return hitungZakatPertanian(config, payload.input);
    case 'FITRAH':
      return hitungZakatFitrah(config, payload.input);
    default:
      throw new Error('Jenis zakat tidak dikenali');
  }
}
