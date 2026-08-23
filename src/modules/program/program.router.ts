import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { ProgramController } from './program.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('program.read'), ProgramController.list);
router.post('/', checkPermission('program.update'), ProgramController.create);
router.patch('/:id', checkPermission('program.update'), ProgramController.update);

export default router;
