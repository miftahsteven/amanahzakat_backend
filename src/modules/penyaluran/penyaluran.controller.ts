import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { PenyaluranService } from './penyaluran.service';

export class PenyaluranController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const asnaf = typeof req.query.asnaf === 'string' ? req.query.asnaf : undefined;
      const data = await PenyaluranService.list(asnaf);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listMustahik(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PenyaluranService.listMustahik();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listProgram(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PenyaluranService.listProgram();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PenyaluranService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Pengajuan penyaluran berhasil dibuat.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async disburse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const data = await PenyaluranService.disburse(id);
      res.status(200).json({
        success: true,
        message: 'Penyaluran dana berhasil dicairkan.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
