import { Router } from 'express';
import { AclController } from './acl.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/roles', checkPermission('acl.manage'), AclController.getRoles);
router.post('/roles', checkPermission('acl.manage'), AclController.createRole);

router.get('/permissions', checkPermission('acl.manage'), AclController.getPermissions);
router.post('/permissions', checkPermission('acl.manage'), AclController.createPermission);

router.post('/assign-permission', checkPermission('acl.manage'), AclController.assignPermissions);

export default router;
