import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { prisma } from '../lib/prisma';

export interface AuthenticatedUserPayload {
  userId: string;
  username: string;
  email: string;
  namaLengkap: string;
  roles: string[];
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Akses ditolak: Token autentikasi Bearer tidak ditemukan.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    // Fetch user with fresh roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Akses ditolak: Pengguna tidak aktif atau tidak terdaftar.',
      });
      return;
    }

    const roles = user.userRoles.map((ur) => ur.role.kodeRole);
    const permissionSet = new Set<string>();

    user.userRoles.forEach((ur) => {
      ur.role.rolePermissions.forEach((rp) => {
        permissionSet.add(rp.permission.kodePermission);
      });
    });

    req.user = {
      userId: user.id,
      username: user.username,
      email: user.email,
      namaLengkap: user.namaLengkap,
      roles,
      permissions: Array.from(permissionSet),
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Akses ditolak: Token JWT kadaluarsa atau tidak valid.',
    });
  }
};
