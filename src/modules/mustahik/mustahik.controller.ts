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
}
