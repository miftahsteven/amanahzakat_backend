import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { InboxController } from './inbox.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('inbox.read'), InboxController.list);
router.patch('/read-all', checkPermission('inbox.read'), InboxController.markAllRead);
router.patch('/:id/read', checkPermission('inbox.read'), InboxController.markRead);

export default router;
