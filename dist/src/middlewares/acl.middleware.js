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
        if (req.user.roles.includes('SUPER_ADMIN')) {
            next();
            return;
        }
        const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
        const hasPermission = required.some((code) => req.user.permissions.includes(code));
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
exports.checkPermission = checkPermission;
