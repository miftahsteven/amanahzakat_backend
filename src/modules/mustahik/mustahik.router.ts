import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { MustahikController } from './mustahik.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('mustahik.read'), MustahikController.list);
router.post('/', checkPermission('mustahik.create'), MustahikController.create);

export default router;
