import { Response, NextFunction } from 'express';
import { AclService } from './acl.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class AclController {
  static async getModules(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const modules = await AclService.getModulesCatalog(includeInactive);
      res.status(200).json({
        success: true,
        data: modules,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createModul(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const modul = await AclService.createModul(req.body);
      res.status(201).json({
        success: true,
        message: 'Modul berhasil ditambahkan.',
        data: modul,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateModul(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const modul = await AclService.updateModul(String(req.params.id), req.body);
      res.status(200).json({
        success: true,
        message: 'Modul berhasil diperbarui.',
        data: modul,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteModul(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const modul = await AclService.deleteModul(String(req.params.id));
      res.status(200).json({
        success: true,
        message: 'Modul berhasil dinonaktifkan.',
        data: modul,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createMenu(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const menu = await AclService.createMenu(req.body);
      res.status(201).json({
        success: true,
        message: 'Menu berhasil ditambahkan.',
        data: menu,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMenu(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const menu = await AclService.updateMenu(String(req.params.id), req.body);
      res.status(200).json({
        success: true,
        message: 'Menu berhasil diperbarui.',
        data: menu,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMenu(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const menu = await AclService.deleteMenu(String(req.params.id));
      res.status(200).json({
        success: true,
        message: 'Menu berhasil dinonaktifkan.',
        data: menu,
      });
    } catch (error) {
      next(error);
    }
  }

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

  static async updatePermission(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const permission = await AclService.updatePermission(String(req.params.id), req.body);
      res.status(200).json({
        success: true,
        message: 'Permission berhasil diperbarui.',
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deletePermission(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const permission = await AclService.deletePermission(String(req.params.id));
      res.status(200).json({
        success: true,
        message: 'Permission berhasil dihapus.',
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  }

  static async syncPermissionRoles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleIds } = req.body;
      const permission = await AclService.syncPermissionRoles(String(req.params.id), roleIds || []);
      res.status(200).json({
        success: true,
        message: 'Assign role untuk permission berhasil disimpan.',
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
