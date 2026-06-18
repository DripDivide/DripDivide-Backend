import Joi from 'joi';
import { groupIdParam, uuidParam } from './common.validator';

const split = Joi.object({
  userId: Joi.string().uuid().required(),
  amount: Joi.number().positive(),
  percentage: Joi.number().positive().max(100),
});

const splitConfiguration = Joi.object({
  type: Joi.string().valid('equal', 'exact', 'percentage').required(),
  splits: Joi.array().items(split).min(1).required(),
});

export const expenseSchemas = {
  create: {
    body: Joi.object({
      groupId: Joi.string().uuid().required(),
      amount: Joi.number().positive().precision(2).required(),
      description: Joi.string().trim().min(1).max(1000).required(),
      splitConfiguration: splitConfiguration.required(),
    }),
  },
  getById: {
    params: uuidParam,
  },
  getByGroup: {
    params: groupIdParam,
  },
  search: {
    query: Joi.object({
      q: Joi.string().trim().allow('').default(''),
      groupId: Joi.string().uuid(),
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(20),
    }),
  },
};
