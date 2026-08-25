import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { MuzakkiService } from './muzakki.service';

export class MuzakkiController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await MuzakkiService.list();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await MuzakkiService.getById(String(req.params.id));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nama, tipe, nikAtauNpwp, hp, email, alamat } = req.body;

      if (!nama || !tipe || !nikAtauNpwp || !hp || !email || !alamat) {
        res.status(400).json({
          success: false,
          message: 'Nama, kategori, NIK/NPWP, HP, email, dan alamat wajib diisi.',
        });
        return;
      }

      const data = await MuzakkiService.create({
        nama: String(nama).trim(),
        tipe: String(tipe),
        nikAtauNpwp: String(nikAtauNpwp).trim(),
        hp: String(hp).trim(),
        email: String(email).trim().toLowerCase(),
        alamat: String(alamat).trim(),
      });

      res.status(201).json({
        success: true,
        message: 'Muzakki berhasil didaftarkan.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nama, tipe, nikAtauNpwp, hp, email, alamat } = req.body;

      if (!nama || !tipe || !nikAtauNpwp || !hp || !email || !alamat) {
        res.status(400).json({
          success: false,
          message: 'Nama, kategori, NIK/NPWP, HP, email, dan alamat wajib diisi.',
        });
        return;
      }

      const data = await MuzakkiService.update(String(req.params.id), {
        nama: String(nama).trim(),
        tipe: String(tipe),
        nikAtauNpwp: String(nikAtauNpwp).trim(),
        hp: String(hp).trim(),
        email: String(email).trim().toLowerCase(),
        alamat: String(alamat).trim(),
      });

      res.status(200).json({
        success: true,
        message: 'Data muzakki berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await MuzakkiService.remove(String(req.params.id));
      res.status(200).json({
        success: true,
        message: 'Muzakki berhasil dihapus.',
      });
    } catch (error) {
      next(error);
    }
  }
}
