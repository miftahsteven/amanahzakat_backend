import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { ProgramController } from './program.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('program.read'), ProgramController.list);
router.get('/:id', checkPermission('program.read'), ProgramController.getById);
router.post('/', checkPermission('program.update'), ProgramController.create);
router.patch('/:id', checkPermission('program.update'), ProgramController.update);
router.delete('/:id', checkPermission('program.delete'), ProgramController.softDelete);

export default router;
