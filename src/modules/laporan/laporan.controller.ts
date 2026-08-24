import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { LaporanService } from './laporan.service';

export class LaporanController {
  static async distribusi(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dari = typeof req.query.dari === 'string' ? req.query.dari : undefined;
      const sampai = typeof req.query.sampai === 'string' ? req.query.sampai : undefined;
      const data = await LaporanService.getDistribusi({ dari, sampai });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async sebaran(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await LaporanService.getSebaran();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async dampak(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await LaporanService.getDampak();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
