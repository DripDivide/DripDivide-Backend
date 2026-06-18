import { Router } from 'express';
import Joi from 'joi';
import { WalletController } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

export function createWalletRoutes(controller: WalletController): Router {
  const router = Router();

  router.use(authenticate);
  router.get('/', controller.getWallet.bind(controller));
  router.post(
    '/connect',
    validate({
      body: Joi.object({
        publicKey: Joi.string().length(56).pattern(/^G/).required(),
        signature: Joi.string().optional(),
      }),
    }),
    controller.connect.bind(controller),
  );
  router.post('/verify', controller.verify.bind(controller));

  return router;
}
