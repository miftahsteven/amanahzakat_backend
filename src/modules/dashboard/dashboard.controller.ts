import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static async summary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dari = typeof req.query.dari === 'string' ? req.query.dari : undefined;
      const sampai = typeof req.query.sampai === 'string' ? req.query.sampai : undefined;
      const skalaRaw = typeof req.query.skala === 'string' ? req.query.skala : undefined;
      const skala =
        skalaRaw === 'harian' || skalaRaw === 'bulanan' || skalaRaw === 'tahunan'
          ? skalaRaw
          : undefined;

      const data = await DashboardService.getSummary({ dari, sampai, skala });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
