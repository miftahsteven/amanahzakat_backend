import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { PortalController } from './portal.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/summary', checkPermission('portal.read'), PortalController.summary);
router.get('/pengajuan', checkPermission('portal.read'), PortalController.listPengajuan);
router.get('/pengajuan/track', checkPermission('portal.read'), PortalController.track);

export default router;
