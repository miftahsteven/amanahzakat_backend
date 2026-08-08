import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const checkPermission = (requiredPermission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Akses ditolak: Pengguna belum terautentikasi.',
      });
      return;
    }

    // SUPER_ADMIN has full access bypass
    if (req.user.roles.includes('SUPER_ADMIN')) {
      next();
      return;
    }

    const hasPermission = req.user.permissions.includes(requiredPermission);

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: `Akses dilarang (403 Forbidden): Anda tidak memiliki izin [${requiredPermission}] untuk mengakses fitur ini.`,
      });
      return;
    }

    next();
  };
};
