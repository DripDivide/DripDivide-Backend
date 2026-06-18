import Joi from 'joi';
import { uuidParam } from './common.validator';

export const settlementSchemas = {
  create: {
    body: Joi.object({
      debtId: Joi.string().uuid().required(),
      signedTransactionXDR: Joi.string().min(1).required(),
    }),
  },
  getById: {
    params: uuidParam,
  },
};
