import Joi from 'joi';

export const userSchemas = {
  balance: {
    params: Joi.object({
      groupId: Joi.string().uuid().required(),
    }),
  },
};
