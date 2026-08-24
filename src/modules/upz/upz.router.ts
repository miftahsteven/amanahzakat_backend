import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { UpzController } from './upz.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/portal', checkPermission('portalUpz.read'), UpzController.portalSummary);
router.get('/', checkPermission('upz.read'), UpzController.list);
router.get('/:id', checkPermission('upz.read'), UpzController.getById);
router.post('/', checkPermission('upz.update'), UpzController.create);
router.patch('/:id', checkPermission('upz.update'), UpzController.update);

export default router;
