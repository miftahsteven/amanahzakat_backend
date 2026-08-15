import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const checkPermission = (requiredPermission: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Akses ditolak: Pengguna belum terautentikasi.',
      });
      return;
    }

    if (req.user.roles.includes('SUPER_ADMIN')) {
      next();
      return;
    }

    const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const hasPermission = required.some((code) => req.user!.permissions.includes(code));

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: `Akses dilarang (403 Forbidden): Anda tidak memiliki izin [${required.join(' atau ')}] untuk mengakses fitur ini.`,
      });
      return;
    }

    next();
  };
};
