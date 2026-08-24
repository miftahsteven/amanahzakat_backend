import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { ApprovalController } from './approval.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('approval.read'), ApprovalController.list);
router.patch('/:id/approve', checkPermission('approval.approve'), ApprovalController.approve);
router.patch('/:id/reject', checkPermission('approval.reject'), ApprovalController.reject);

export default router;
