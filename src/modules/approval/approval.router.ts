import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { ApprovalController } from './approval.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('penyaluran.verify'), ApprovalController.list);
router.patch('/:id/approve', checkPermission('penyaluran.verify'), ApprovalController.approve);
router.patch('/:id/reject', checkPermission('penyaluran.verify'), ApprovalController.reject);

export default router;
