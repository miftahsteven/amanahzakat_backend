import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UpzService } from './upz.service';

const KATEGORI_VALID = ['Masjid', 'Instansi Pemerintah', 'BUMN / Korporat', 'Sekolah / Kampus'];
const STATUS_VALID = ['Patuh', 'Perlu Audit', 'Baru'];

export class UpzController {
  static async portalSummary(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await UpzService.portalSummary();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const kategori = typeof req.query.kategori === 'string' ? req.query.kategori : undefined;
      const statusKepatuhan =
        typeof req.query.statusKepatuhan === 'string' ? req.query.statusKepatuhan : undefined;
      const data = await UpzService.list(kategori, statusKepatuhan);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await UpzService.getById(String(req.params.id));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        nama,
        kategori,
        hakPengelolaanPct,
        totalPenghimpunan,
        totalPenyaluran,
        statusKepatuhan,
      } = req.body;

      if (!nama || !kategori) {
        res.status(400).json({
          success: false,
          message: 'Nama UPZ dan kategori wajib diisi.',
        });
        return;
      }

      if (!KATEGORI_VALID.includes(String(kategori))) {
        res.status(400).json({
          success: false,
          message: `Kategori tidak valid. Pilih: ${KATEGORI_VALID.join(', ')}.`,
        });
        return;
      }

      if (statusKepatuhan && !STATUS_VALID.includes(String(statusKepatuhan))) {
        res.status(400).json({
          success: false,
          message: `Status kepatuhan tidak valid. Pilih: ${STATUS_VALID.join(', ')}.`,
        });
        return;
      }

      const data = await UpzService.create({
        nama: String(nama).trim(),
        kategori: String(kategori),
        hakPengelolaanPct: hakPengelolaanPct != null ? Number(hakPengelolaanPct) : undefined,
        totalPenghimpunan: totalPenghimpunan != null ? Number(totalPenghimpunan) : undefined,
        totalPenyaluran: totalPenyaluran != null ? Number(totalPenyaluran) : undefined,
        statusKepatuhan: statusKepatuhan ? String(statusKepatuhan) : undefined,
      });

      res.status(201).json({
        success: true,
        message: `UPZ terdaftar dengan kode ${data.kodeUpz}.`,
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
        kategori,
        hakPengelolaanPct,
        totalPenghimpunan,
        totalPenyaluran,
        statusKepatuhan,
      } = req.body;

      if (kategori && !KATEGORI_VALID.includes(String(kategori))) {
        res.status(400).json({
          success: false,
          message: `Kategori tidak valid. Pilih: ${KATEGORI_VALID.join(', ')}.`,
        });
        return;
      }

      if (statusKepatuhan && !STATUS_VALID.includes(String(statusKepatuhan))) {
        res.status(400).json({
          success: false,
          message: `Status kepatuhan tidak valid. Pilih: ${STATUS_VALID.join(', ')}.`,
        });
        return;
      }

      const data = await UpzService.update(id, {
        ...(nama !== undefined && { nama: String(nama).trim() }),
        ...(kategori !== undefined && { kategori: String(kategori) }),
        ...(hakPengelolaanPct !== undefined && { hakPengelolaanPct: Number(hakPengelolaanPct) }),
        ...(totalPenghimpunan !== undefined && { totalPenghimpunan: Number(totalPenghimpunan) }),
        ...(totalPenyaluran !== undefined && { totalPenyaluran: Number(totalPenyaluran) }),
        ...(statusKepatuhan !== undefined && { statusKepatuhan: String(statusKepatuhan) }),
      });

      res.status(200).json({
        success: true,
        message: 'Data UPZ cabang berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
