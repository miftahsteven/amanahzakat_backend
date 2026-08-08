"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AclController = void 0;
const acl_service_1 = require("./acl.service");
class AclController {
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
