import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { PortalService } from './portal.service';

export class PortalController {
  static async summary(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await PortalService.getSummary();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listPengajuan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const data = await PortalService.listPengajuan(limit);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async track(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const data = await PortalService.track(q);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
