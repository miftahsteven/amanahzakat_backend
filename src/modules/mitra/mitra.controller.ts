import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { MitraService } from './mitra.service';

const BENTUK_VALID = ['Yayasan', 'Komunitas', 'LKM Syariah', 'Pesantren'];
const LPJ_STATUS_VALID = ['Terverifikasi', 'Menunggu LPJ', 'Tertunda'];

export class MitraController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const statusLpj = typeof req.query.statusLpj === 'string' ? req.query.statusLpj : undefined;
      const data = await MitraService.list(statusLpj);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await MitraService.getById(String(req.params.id));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nama, bentukLembaga, masaKerjasama, picKontak, hpPic, totalPenyaluran, statusLaporanLpj } =
        req.body;

      if (!nama || !bentukLembaga || !masaKerjasama || !picKontak || !hpPic) {
        res.status(400).json({
          success: false,
          message: 'Nama lembaga, bentuk lembaga, masa kerjasama, PIC, dan HP PIC wajib diisi.',
        });
        return;
      }

      if (!BENTUK_VALID.includes(String(bentukLembaga))) {
        res.status(400).json({
          success: false,
          message: `Bentuk lembaga tidak valid. Pilih: ${BENTUK_VALID.join(', ')}.`,
        });
        return;
      }

      if (statusLaporanLpj && !LPJ_STATUS_VALID.includes(String(statusLaporanLpj))) {
        res.status(400).json({
          success: false,
          message: `Status LPJ tidak valid. Pilih: ${LPJ_STATUS_VALID.join(', ')}.`,
        });
        return;
      }

      const data = await MitraService.create({
        nama: String(nama).trim(),
        bentukLembaga: String(bentukLembaga),
        masaKerjasama: String(masaKerjasama).trim(),
        picKontak: String(picKontak).trim(),
        hpPic: String(hpPic).trim(),
        totalPenyaluran: totalPenyaluran != null ? Number(totalPenyaluran) : undefined,
        statusLaporanLpj: statusLaporanLpj ? String(statusLaporanLpj) : undefined,
      });

      res.status(201).json({
        success: true,
        message: `Mitra penyalur terdaftar dengan MoU ${data.noMou}.`,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { nama, bentukLembaga, masaKerjasama, picKontak, hpPic, totalPenyaluran, statusLaporanLpj } =
        req.body;

      if (bentukLembaga && !BENTUK_VALID.includes(String(bentukLembaga))) {
        res.status(400).json({
          success: false,
          message: `Bentuk lembaga tidak valid. Pilih: ${BENTUK_VALID.join(', ')}.`,
        });
        return;
      }

      if (statusLaporanLpj && !LPJ_STATUS_VALID.includes(String(statusLaporanLpj))) {
        res.status(400).json({
          success: false,
          message: `Status LPJ tidak valid. Pilih: ${LPJ_STATUS_VALID.join(', ')}.`,
        });
        return;
      }

      const data = await MitraService.update(id, {
        ...(nama !== undefined && { nama: String(nama).trim() }),
        ...(bentukLembaga !== undefined && { bentukLembaga: String(bentukLembaga) }),
        ...(masaKerjasama !== undefined && { masaKerjasama: String(masaKerjasama).trim() }),
        ...(picKontak !== undefined && { picKontak: String(picKontak).trim() }),
        ...(hpPic !== undefined && { hpPic: String(hpPic).trim() }),
        ...(totalPenyaluran !== undefined && { totalPenyaluran: Number(totalPenyaluran) }),
        ...(statusLaporanLpj !== undefined && { statusLaporanLpj: String(statusLaporanLpj) }),
      });

      res.status(200).json({
        success: true,
        message: 'Data mitra penyalur berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
