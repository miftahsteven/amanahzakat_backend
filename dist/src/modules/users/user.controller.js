"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
class UserController {
    static async getUsers(req, res, next) {
        try {
            const users = await user_service_1.UserService.getUsers();
            res.status(200).json({
                success: true,
                data: users,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserById(req, res, next) {
        try {
            const user = await user_service_1.UserService.getUserById(req.params.id);
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createUser(req, res, next) {
        try {
            const user = await user_service_1.UserService.createUser(req.body);
            res.status(201).json({
                success: true,
                message: 'Pengguna baru berhasil ditambahkan.',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateUser(req, res, next) {
        try {
            const user = await user_service_1.UserService.updateUser(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Data pengguna berhasil diperbarui.',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteUser(req, res, next) {
        try {
            await user_service_1.UserService.deleteUser(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Pengguna berhasil dinonaktifkan.',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
