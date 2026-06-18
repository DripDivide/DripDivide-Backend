import winston from 'winston';
import { config } from '../config';

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  config.logging.format === 'json' ? winston.format.json() : winston.format.simple(),
);

export const logger = winston.createLogger({
  level: config.logging.level,
  silent: config.logging.level === 'silent',
  format,
  defaultMeta: {
    service: 'drips-divide-api',
    environment: config.env,
  },
  transports: [new winston.transports.Console()],
});
