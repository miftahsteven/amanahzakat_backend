import { Router } from 'express';
import { AclController } from './acl.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';

const router = Router();

router.use(authenticateJWT);

// Catalog for ACL mapping (active only) and module management (?includeInactive=true)
router.get(
  '/modules',
  checkPermission(['acl-management.read', 'module-management.read', 'permission-management.read']),
  AclController.getModules
);
router.post('/modules', checkPermission('module-management.manage'), AclController.createModul);
router.patch('/modules/:id', checkPermission('module-management.manage'), AclController.updateModul);
router.delete('/modules/:id', checkPermission('module-management.manage'), AclController.deleteModul);

router.post('/menus', checkPermission('module-management.manage'), AclController.createMenu);
router.patch('/menus/:id', checkPermission('module-management.manage'), AclController.updateMenu);
router.delete('/menus/:id', checkPermission('module-management.manage'), AclController.deleteMenu);

router.get(
  '/roles',
  checkPermission(['acl-management.read', 'permission-management.read']),
  AclController.getRoles
);
router.post('/roles', checkPermission('acl-management.manage'), AclController.createRole);

router.get(
  '/permissions',
  checkPermission(['acl-management.read', 'permission-management.read']),
  AclController.getPermissions
);
router.post('/permissions', checkPermission('permission-management.manage'), AclController.createPermission);
router.patch('/permissions/:id', checkPermission('permission-management.manage'), AclController.updatePermission);
router.delete('/permissions/:id', checkPermission('permission-management.manage'), AclController.deletePermission);
router.post(
  '/permissions/:id/assign-roles',
  checkPermission('permission-management.manage'),
  AclController.syncPermissionRoles
);

router.post('/assign-permission', checkPermission('acl-management.manage'), AclController.assignPermissions);

export default router;
