import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { KeuanganService } from './keuangan.service';
import { SimbaLapkinService } from './simba-lapkin.service';

export class KeuanganController {
  static async listCoa(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await KeuanganService.listCoa();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listJurnal(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await KeuanganService.listJurnal();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createJurnal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await KeuanganService.createJurnal(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listSimba(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const periode = typeof req.query.periode === 'string' ? req.query.periode : undefined;
      const data = await SimbaLapkinService.list(periode);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async detailSimba(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const kodeForm = String(req.params.kodeForm);
      const periode = typeof req.query.periode === 'string' ? req.query.periode : undefined;
      const data = await SimbaLapkinService.detail(kodeForm, periode);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async exportSimba(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const kodeForm = String(req.params.kodeForm);
      const data = await SimbaLapkinService.markExported(kodeForm);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getClosing(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await KeuanganService.getClosing();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateClosingStep(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { periode, stepId, done } = req.body;
      const data = await KeuanganService.updateClosingStep(periode, stepId, !!done);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async toggleClosingLock(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { periode, lock } = req.body;
      const data = await KeuanganService.toggleClosingLock(periode, !!lock);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async laporanKeuangan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dari = typeof req.query.dari === 'string' ? req.query.dari : undefined;
      const sampai = typeof req.query.sampai === 'string' ? req.query.sampai : undefined;
      const data = await KeuanganService.getLaporanKeuangan({ dari, sampai });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
