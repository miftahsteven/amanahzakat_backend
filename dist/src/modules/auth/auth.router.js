"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_schema_1 = require("./auth.schema");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public Auth Endpoints
router.post('/login', (0, validate_middleware_1.validateRequest)(auth_schema_1.loginSchema), auth_controller_1.AuthController.login);
router.post('/verify-otp', (0, validate_middleware_1.validateRequest)(auth_schema_1.verifyOtpSchema), auth_controller_1.AuthController.verifyOtp);
router.post('/refresh', (0, validate_middleware_1.validateRequest)(auth_schema_1.refreshTokenSchema), auth_controller_1.AuthController.refresh);
// Protected Auth Endpoints (Requires Bearer JWT)
router.get('/me', auth_middleware_1.authenticateJWT, auth_controller_1.AuthController.me);
exports.default = router;
