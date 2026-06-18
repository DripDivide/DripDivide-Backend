import type { NextFunction, Request, Response } from 'express';
import type Joi from 'joi';

interface RequestSchemas {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}

export function validate(schemas: RequestSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const details = [];

    for (const [key, schema] of Object.entries(schemas) as Array<
      [keyof RequestSchemas, Joi.ObjectSchema | undefined]
    >) {
      if (!schema) continue;
      const result = schema.validate(req[key], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (result.error) {
        details.push(
          ...result.error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
            source: key,
          })),
        );
      } else {
        (req as any)[key] = result.value;
      }
    }

    if (details.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details,
        },
      });
      return;
    }

    next();
  };
}
