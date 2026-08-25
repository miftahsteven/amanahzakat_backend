import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { PenerimaanService } from './penerimaan.service';

export class PenerimaanController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const jenisZis = typeof req.query.jenisZis === 'string' ? req.query.jenisZis : undefined;
      const data = await PenerimaanService.list(jenisZis);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listMuzakki(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PenerimaanService.listMuzakki();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PenerimaanService.getById(String(req.params.id));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PenerimaanService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Penerimaan ZIS berhasil dicatat.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const data = await PenerimaanService.verify(id);
      res.status(200).json({
        success: true,
        message: 'Penerimaan ZIS berhasil diverifikasi.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PenerimaanService.update(String(req.params.id), req.body);
      res.status(200).json({
        success: true,
        message: 'Transaksi penerimaan berhasil diperbarui.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await PenerimaanService.remove(String(req.params.id));
      res.status(200).json({
        success: true,
        message: 'Transaksi penerimaan berhasil dihapus.',
      });
    } catch (error) {
      next(error);
    }
  }
}
