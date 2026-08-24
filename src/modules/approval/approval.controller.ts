import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { ApprovalService } from './approval.service';

export class ApprovalController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const data = await ApprovalService.list(status);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async approve(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ApprovalService.approve(String(req.params.id));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async reject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const catatan = typeof req.body?.catatan === 'string' ? req.body.catatan : undefined;
      const data = await ApprovalService.reject(String(req.params.id), catatan);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
