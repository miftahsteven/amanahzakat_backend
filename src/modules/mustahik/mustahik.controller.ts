import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { MustahikService } from './mustahik.service';

export class MustahikController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const asnaf = typeof req.query.asnaf === 'string' ? req.query.asnaf : undefined;
      const data = await MustahikService.list(asnaf);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await MustahikService.getById(String(req.params.id));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateGps(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lat, lng } = req.body;
      if (lat == null || lng == null) {
        res.status(400).json({ success: false, message: 'Koordinat lat dan lng wajib diisi.' });
        return;
      }
      const data = await MustahikService.updateGps(String(req.params.id), Number(lat), Number(lng));
      res.status(200).json({ success: true, message: 'Koordinat GPS mustahik diperbarui.', data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        nik,
        nama,
        kategoriAsnaf,
        hp,
        alamat,
        pekerjaan,
        jumlahTanggungan,
        penghasilanBulanan,
        rekeningBank,
      } = req.body;

      if (!nik || !nama || !kategoriAsnaf || !hp || !alamat || !pekerjaan || !rekeningBank) {
        res.status(400).json({
          success: false,
          message: 'NIK, nama, asnaf, HP, alamat, pekerjaan, dan rekening bank wajib diisi.',
        });
        return;
      }

      if (String(nik).length !== 16) {
        res.status(400).json({
          success: false,
          message: 'NIK harus tepat 16 digit.',
        });
        return;
      }

      const data = await MustahikService.create({
        nik: String(nik).trim(),
        nama: String(nama).trim(),
        kategoriAsnaf: String(kategoriAsnaf),
        hp: String(hp).trim(),
        alamat: String(alamat).trim(),
        pekerjaan: String(pekerjaan).trim(),
        jumlahTanggungan: Number(jumlahTanggungan) || 0,
        penghasilanBulanan: Number(penghasilanBulanan) || 0,
        rekeningBank: String(rekeningBank).trim(),
      });

      res.status(201).json({
        success: true,
        message: 'Mustahik berhasil didaftarkan & diverifikasi.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        nama,
        kategoriAsnaf,
        hp,
        alamat,
        pekerjaan,
        jumlahTanggungan,
        penghasilanBulanan,
        rekeningBank,
        statusSurvei,
      } = req.body;

      if (!nama || !kategoriAsnaf || !hp || !alamat || !pekerjaan || !rekeningBank) {
        res.status(400).json({
          success: false,
          message: 'Nama, asnaf, HP, alamat, pekerjaan, dan rekening bank wajib diisi.',
        });
        return;
      }

      const data = await MustahikService.update(String(req.params.id), {
        nama: String(nama).trim(),
        kategoriAsnaf: String(kategoriAsnaf),
        hp: String(hp).trim(),
        alamat: String(alamat).trim(),
        pekerjaan: String(pekerjaan).trim(),
        jumlahTanggungan: Number(jumlahTanggungan) || 0,
        penghasilanBulanan: Number(penghasilanBulanan) || 0,
        rekeningBank: String(rekeningBank).trim(),
        statusSurvei: statusSurvei ? String(statusSurvei) : undefined,
      });

      res.status(200).json({
        success: true,
        message: 'Data mustahik berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await MustahikService.remove(String(req.params.id));
      res.status(200).json({
        success: true,
        message: 'Mustahik berhasil dihapus.',
      });
    } catch (error) {
      next(error);
    }
  }
}
