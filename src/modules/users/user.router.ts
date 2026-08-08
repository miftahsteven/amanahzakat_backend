import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('user.manage'), UserController.getUsers);
router.get('/:id', checkPermission('user.manage'), UserController.getUserById);
router.post('/', checkPermission('user.manage'), UserController.createUser);
router.patch('/:id', checkPermission('user.manage'), UserController.updateUser);
router.delete('/:id', checkPermission('user.manage'), UserController.deleteUser);

export default router;
