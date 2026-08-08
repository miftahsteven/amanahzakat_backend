import { Response, NextFunction } from 'express';
import { AclService } from './acl.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class AclController {
  static async getRoles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await AclService.getRoles();
      res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await AclService.createRole(req.body);
      res.status(201).json({
        success: true,
        message: 'Role berhasil ditambahkan.',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissions = await AclService.getPermissions();
      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPermission(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const permission = await AclService.createPermission(req.body);
      res.status(201).json({
        success: true,
        message: 'Permission berhasil ditambahkan.',
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleId, permissionIds } = req.body;
      const updated = await AclService.assignPermissionsToRole(roleId, permissionIds);
      res.status(200).json({
        success: true,
        message: 'Hak akses permission berhasil diperbarui untuk role ini.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
