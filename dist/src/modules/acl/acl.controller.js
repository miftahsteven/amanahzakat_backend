"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AclController = void 0;
const acl_service_1 = require("./acl.service");
class AclController {
    static async getModules(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const modules = await acl_service_1.AclService.getModulesCatalog(includeInactive);
            res.status(200).json({
                success: true,
                data: modules,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createModul(req, res, next) {
        try {
            const modul = await acl_service_1.AclService.createModul(req.body);
            res.status(201).json({
                success: true,
                message: 'Modul berhasil ditambahkan.',
                data: modul,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateModul(req, res, next) {
        try {
            const modul = await acl_service_1.AclService.updateModul(String(req.params.id), req.body);
            res.status(200).json({
                success: true,
                message: 'Modul berhasil diperbarui.',
                data: modul,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteModul(req, res, next) {
        try {
            const modul = await acl_service_1.AclService.deleteModul(String(req.params.id));
            res.status(200).json({
                success: true,
                message: 'Modul berhasil dinonaktifkan.',
                data: modul,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createMenu(req, res, next) {
        try {
            const menu = await acl_service_1.AclService.createMenu(req.body);
            res.status(201).json({
                success: true,
                message: 'Menu berhasil ditambahkan.',
                data: menu,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMenu(req, res, next) {
        try {
            const menu = await acl_service_1.AclService.updateMenu(String(req.params.id), req.body);
            res.status(200).json({
                success: true,
                message: 'Menu berhasil diperbarui.',
                data: menu,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteMenu(req, res, next) {
        try {
            const menu = await acl_service_1.AclService.deleteMenu(String(req.params.id));
            res.status(200).json({
                success: true,
                message: 'Menu berhasil dinonaktifkan.',
                data: menu,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRoles(req, res, next) {
        try {
            const roles = await acl_service_1.AclService.getRoles();
            res.status(200).json({
                success: true,
                data: roles,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createRole(req, res, next) {
        try {
            const role = await acl_service_1.AclService.createRole(req.body);
            res.status(201).json({
                success: true,
                message: 'Role berhasil ditambahkan.',
                data: role,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPermissions(req, res, next) {
        try {
            const permissions = await acl_service_1.AclService.getPermissions();
            res.status(200).json({
                success: true,
                data: permissions,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createPermission(req, res, next) {
        try {
            const permission = await acl_service_1.AclService.createPermission(req.body);
            res.status(201).json({
                success: true,
                message: 'Permission berhasil ditambahkan.',
                data: permission,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePermission(req, res, next) {
        try {
            const permission = await acl_service_1.AclService.updatePermission(String(req.params.id), req.body);
            res.status(200).json({
                success: true,
                message: 'Permission berhasil diperbarui.',
                data: permission,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePermission(req, res, next) {
        try {
            const permission = await acl_service_1.AclService.deletePermission(String(req.params.id));
            res.status(200).json({
                success: true,
                message: 'Permission berhasil dihapus.',
                data: permission,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async syncPermissionRoles(req, res, next) {
        try {
            const { roleIds } = req.body;
            const permission = await acl_service_1.AclService.syncPermissionRoles(String(req.params.id), roleIds || []);
            res.status(200).json({
                success: true,
                message: 'Assign role untuk permission berhasil disimpan.',
                data: permission,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async assignPermissions(req, res, next) {
        try {
            const { roleId, permissionIds } = req.body;
            const updated = await acl_service_1.AclService.assignPermissionsToRole(roleId, permissionIds);
            res.status(200).json({
                success: true,
                message: 'Hak akses permission berhasil diperbarui untuk role ini.',
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AclController = AclController;
