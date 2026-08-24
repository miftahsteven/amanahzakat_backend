import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { DashboardController } from './dashboard.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/summary', checkPermission('dashboard.read'), DashboardController.summary);

export default router;
