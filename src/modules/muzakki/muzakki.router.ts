import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { MuzakkiController } from './muzakki.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('muzakki.read'), MuzakkiController.list);
router.post('/', checkPermission('muzakki.create'), MuzakkiController.create);

export default router;
