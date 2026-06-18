import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validator';
import { authSchemas } from '../validators/auth.validator';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/register', authRateLimiter, validate(authSchemas.register), controller.register.bind(controller));
  router.post('/login', authRateLimiter, validate(authSchemas.login), controller.login.bind(controller));
  router.post('/refresh', authenticate, controller.refresh.bind(controller));
  router.post('/logout', authenticate, controller.logout.bind(controller));

  return router;
}
