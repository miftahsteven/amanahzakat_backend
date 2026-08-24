import { z } from 'zod';

export const updateZakatConfigSchema = z.object({
  body: z.object({
    hargaEmasPerGram: z.number().int().positive(),
    hargaBerasPerKg: z.number().int().positive(),
    nisabEmasGram: z.number().positive(),
    nisabBerasKg: z.number().positive(),
    nisabPertanianKg: z.number().positive(),
    zakatRate: z.number().min(0).max(1),
    fitrahKgPerJiwa: z.number().positive(),
  }),
});

const profesiInput = z.object({
  jenis: z.literal('PROFESI'),
  input: z.object({
    pendapatanBulanan: z.number().min(0),
    bonus: z.number().min(0).optional(),
    kebutuhanPokok: z.number().min(0).optional(),
  }),
});

const maalInput = z.object({
  jenis: z.literal('MAAL'),
  input: z.object({
    tabungan: z.number().min(0),
    investasi: z.number().min(0),
    emasGram: z.number().min(0),
    piutangLancar: z.number().min(0).optional(),
    hutangJatuhTempo: z.number().min(0).optional(),
  }),
});

const pertanianInput = z.object({
  jenis: z.literal('PERTANIAN'),
  input: z.object({
    hasilPanenKg: z.number().min(0),
    hargaKg: z.number().min(0).optional(),
    irigasiBerbayar: z.boolean().optional(),
  }),
});

const fitrahInput = z.object({
  jenis: z.literal('FITRAH'),
  input: z.object({
    jumlahJiwa: z.number().int().min(0),
    hargaBerasKg: z.number().min(0).optional(),
  }),
});

export const hitungZakatSchema = z.object({
  body: z.discriminatedUnion('jenis', [profesiInput, maalInput, pertanianInput, fitrahInput]),
});

export const listRiwayatSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    jenis: z.enum(['PROFESI', 'MAAL', 'PERTANIAN', 'FITRAH']).optional(),
    sumber: z.enum(['ERP', 'WEB_PUBLIC']).optional(),
  }),
});
