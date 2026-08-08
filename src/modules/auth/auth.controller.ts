import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class AuthController {
  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body, req.ip);
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          challengeId: result.challengeId,
          expiresInSeconds: result.expiresInSeconds,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.verifyOtp(req.body, req.ip);
      res.status(200).json({
        success: true,
        message: 'Verifikasi OTP berhasil. Selamat datang di Amanah Zakat ERP!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.getCurrentUser(req.user!.userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.refreshToken(req.body.refreshToken);
      res.status(200).json({
        success: true,
        message: 'Token berhasil diperbarui.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
