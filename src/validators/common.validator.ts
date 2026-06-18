import Joi from 'joi';

export const uuidParam = Joi.object({
  id: Joi.string().uuid().required(),
});

export const groupIdParam = Joi.object({
  groupId: Joi.string().uuid().required(),
});

export const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});
