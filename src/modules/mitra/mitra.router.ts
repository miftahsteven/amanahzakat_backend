import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { MitraController } from './mitra.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('mitra.read'), MitraController.list);
router.get('/:id', checkPermission('mitra.read'), MitraController.getById);
router.post('/', checkPermission('mitra.create'), MitraController.create);
router.patch('/:id', checkPermission('mitra.update'), MitraController.update);

export default router;
