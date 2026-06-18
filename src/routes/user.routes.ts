import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.use(authenticate);
  router.get('/me', controller.me.bind(controller));

  return router;
}
