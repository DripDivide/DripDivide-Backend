import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { groupSchemas } from '../validators/group.validator';

export function createGroupRoutes(controller: GroupController): Router {
  const router = Router();

  router.use(authenticate);
  router.post('/', validate(groupSchemas.create), controller.createGroup.bind(controller));
  router.get('/', controller.getGroups.bind(controller));
  router.get('/:id', validate(groupSchemas.getById), controller.getGroup.bind(controller));
  router.post('/:id/invite', validate(groupSchemas.invite), controller.inviteMember.bind(controller));

  return router;
}
