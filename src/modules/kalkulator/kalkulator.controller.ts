import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { KalkulatorService } from './kalkulator.service';
import { ZakatHitungInput } from '../../lib/zakat-calculator';

export class KalkulatorController {
  static async getConfig(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await KalkulatorService.getConfig();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateConfig(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await KalkulatorService.updateConfig(req.body, req.user?.userId);
      res.status(200).json({ success: true, data, message: 'Parameter nisab zakat berhasil diperbarui.' });
    } catch (error) {
      next(error);
    }
  }

  static async hitung(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as ZakatHitungInput;
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const data = await KalkulatorService.hitung(payload, {
        sumber: 'ERP',
        userId: req.user?.userId,
        ipAddress,
      });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async listRiwayat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : undefined;
      const jenis = typeof req.query.jenis === 'string' ? req.query.jenis : undefined;
      const sumber = typeof req.query.sumber === 'string' ? req.query.sumber : undefined;
      const data = await KalkulatorService.listRiwayat({ limit, jenis: jenis as any, sumber });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const getPublicZakatConfig = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await KalkulatorService.getConfig();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const postPublicZakatHitung = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = req.body as ZakatHitungInput;
    const ipAddress = req.ip || req.socket.remoteAddress || undefined;
    const data = await KalkulatorService.hitung(payload, {
      sumber: 'WEB_PUBLIC',
      ipAddress,
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
