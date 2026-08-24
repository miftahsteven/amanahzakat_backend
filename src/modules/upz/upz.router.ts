import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { UpzController } from './upz.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('upz.read'), UpzController.list);
router.post('/', checkPermission('upz.update'), UpzController.create);
router.patch('/:id', checkPermission('upz.update'), UpzController.update);

export default router;
