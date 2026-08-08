import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { loginSchema, verifyOtpSchema, refreshTokenSchema } from './auth.schema';
import { authenticateJWT } from '../../middlewares/auth.middleware';

const router = Router();

// Public Auth Endpoints
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/verify-otp', validateRequest(verifyOtpSchema), AuthController.verifyOtp);
router.post('/refresh', validateRequest(refreshTokenSchema), AuthController.refresh);

// Protected Auth Endpoints (Requires Bearer JWT)
router.get('/me', authenticateJWT, AuthController.me);

export default router;
