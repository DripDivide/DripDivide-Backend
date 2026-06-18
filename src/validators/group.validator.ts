import Joi from 'joi';
import { uuidParam } from './common.validator';

export const groupSchemas = {
  create: {
    body: Joi.object({
      name: Joi.string().trim().min(1).max(255).required(),
    }),
  },
  getById: {
    params: uuidParam,
  },
  invite: {
    params: uuidParam,
    body: Joi.object({
      email: Joi.string().email().required(),
      role: Joi.string().valid('admin', 'member').default('member'),
    }),
  },
};
