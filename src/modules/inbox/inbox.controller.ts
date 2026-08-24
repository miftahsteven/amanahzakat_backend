import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { InboxService } from './inbox.service';

export class InboxController {
  static async list(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await InboxService.syncFromEvents();
      const data = await InboxService.list();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await InboxService.markRead(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await InboxService.markAllRead();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
