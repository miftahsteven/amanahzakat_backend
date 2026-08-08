"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = void 0;
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
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
exports.checkPermission = checkPermission;
