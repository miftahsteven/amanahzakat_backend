"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_router_1 = __importDefault(require("./modules/auth/auth.router"));
const user_router_1 = __importDefault(require("./modules/users/user.router"));
const acl_router_1 = __importDefault(require("./modules/acl/acl.router"));
const public_router_1 = __importDefault(require("./modules/public/public.router"));
const cms_router_1 = __importDefault(require("./modules/cms/cms.router"));
const router = (0, express_1.Router)();
// API Health Check
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        app: 'Amanah Zakat ERP Backend Service',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// Route Modules
router.use('/auth', auth_router_1.default);
router.use('/users', user_router_1.default);
router.use('/acl', acl_router_1.default);
router.use('/public', public_router_1.default);
router.use('/cms', cms_router_1.default);
exports.default = router;
