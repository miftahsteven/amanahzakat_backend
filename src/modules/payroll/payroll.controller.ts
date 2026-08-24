import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { PayrollService } from './payroll.service';

const DIVISI_VALID = ['Penghimpunan', 'Penyaluran & Program', 'Keuangan & Akuntansi', 'SDM & Umum'];
const STATUS_VALID = ['Tetap', 'Kontrak', 'Relawan'];

export class PayrollController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const divisi = typeof req.query.divisi === 'string' ? req.query.divisi : undefined;
      const data = await PayrollService.list(divisi);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        nama,
        jabatan,
        divisi,
        gajiPokok,
        tunjanganAmil,
        keikutsertaanPayroll,
        statusKerja,
      } = req.body;

      if (!nama || !jabatan || !divisi || gajiPokok == null || tunjanganAmil == null) {
        res.status(400).json({
          success: false,
          message: 'Nama, jabatan, divisi, gaji pokok, dan tunjangan amil wajib diisi.',
        });
        return;
      }

      if (!DIVISI_VALID.includes(String(divisi))) {
        res.status(400).json({
          success: false,
          message: `Divisi tidak valid. Pilih: ${DIVISI_VALID.join(', ')}.`,
        });
        return;
      }

      if (statusKerja && !STATUS_VALID.includes(String(statusKerja))) {
        res.status(400).json({
          success: false,
          message: `Status kerja tidak valid. Pilih: ${STATUS_VALID.join(', ')}.`,
        });
        return;
      }

      const data = await PayrollService.create({
        nama: String(nama).trim(),
        jabatan: String(jabatan).trim(),
        divisi: String(divisi),
        gajiPokok: Number(gajiPokok),
        tunjanganAmil: Number(tunjanganAmil),
        keikutsertaanPayroll:
          keikutsertaanPayroll !== undefined ? Boolean(keikutsertaanPayroll) : undefined,
        statusKerja: statusKerja ? String(statusKerja) : undefined,
      });

      res.status(201).json({
        success: true,
        message: `Amil terdaftar dengan NIP ${data.nip}.`,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const {
        nama,
        jabatan,
        divisi,
        gajiPokok,
        tunjanganAmil,
        keikutsertaanPayroll,
        statusKerja,
      } = req.body;

      if (divisi && !DIVISI_VALID.includes(String(divisi))) {
        res.status(400).json({
          success: false,
          message: `Divisi tidak valid. Pilih: ${DIVISI_VALID.join(', ')}.`,
        });
        return;
      }

      if (statusKerja && !STATUS_VALID.includes(String(statusKerja))) {
        res.status(400).json({
          success: false,
          message: `Status kerja tidak valid. Pilih: ${STATUS_VALID.join(', ')}.`,
        });
        return;
      }

      const data = await PayrollService.update(id, {
        ...(nama !== undefined && { nama: String(nama).trim() }),
        ...(jabatan !== undefined && { jabatan: String(jabatan).trim() }),
        ...(divisi !== undefined && { divisi: String(divisi) }),
        ...(gajiPokok !== undefined && { gajiPokok: Number(gajiPokok) }),
        ...(tunjanganAmil !== undefined && { tunjanganAmil: Number(tunjanganAmil) }),
        ...(keikutsertaanPayroll !== undefined && {
          keikutsertaanPayroll: Boolean(keikutsertaanPayroll),
        }),
        ...(statusKerja !== undefined && { statusKerja: String(statusKerja) }),
      });

      res.status(200).json({
        success: true,
        message: 'Data amil berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async process(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const periode = typeof req.body?.periode === 'string' ? req.body.periode : undefined;
      const data = await PayrollService.processPayroll(periode);
      res.status(200).json({
        success: true,
        message: `Payroll ${data.periode} berhasil diproses untuk ${data.jumlahAmil} amil.`,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
