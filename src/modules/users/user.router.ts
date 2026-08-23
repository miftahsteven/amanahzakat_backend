import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('user-management.read'), UserController.getUsers);
router.get('/:id', checkPermission('user-management.read'), UserController.getUserById);
router.post('/', checkPermission('user-management.manage'), UserController.createUser);
router.patch('/:id', checkPermission('user-management.manage'), UserController.updateUser);
router.delete('/:id', checkPermission('user-management.manage'), UserController.deleteUser);

export default router;
